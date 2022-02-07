import { AnimatePresence, motion, useViewportScroll } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAiringTodayTvs,
  getOnTheAirTvs,
  getPopularTvs,
  getTopRatedTvs,
  IGetTvsResult,
} from '../api';
import { makeImagePath } from '../utils';

const Wrapper = styled.div`
  background-color: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  // 두개의 배경 사용 (배경 이미지 위에 linear-gradient를 덮는다)
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

const Sliders = styled.div`
  display: flex;
  flex-direction: column;
  /* top: -100px; */
`;

const Slider = styled.div`
  position: relative;
  margin-top: 232px;
  top: -100px;

  &:first-child {
    margin-top: 0;
  }

  h1 {
    font-size: 32px;
    margin-left: 60px;
    margin-bottom: 16px;
  }
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  cursor: pointer;

  // 양 끝에 있는건 각각 오른쪽, 왼쪽으로만 커지게
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const NextButton = styled.button`
  position: absolute;
  top: 2px;
  right: 60px;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.white.lighter};
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.white.lighter};
  border-radius: 20px;
  cursor: pointer;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigTv = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigScoreWrapper = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  top: -80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BigVote = styled.span<{ vote: number }>`
  font-size: 20px;
  width: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-weight: 600;
  background-color: ${(props) =>
    props.vote > 7 ? '#0ca678' : props.vote > 4 ? '#f59f00' : '#f03e3e'};
  color: ${(props) => props.theme.black.lighter};
  text-align: center;
`;

const BigVoteCount = styled.span``;

const BigPopularity = styled.span`
  span {
    font-weight: 800;
  }
`;

const BigOverview = styled.p`
  padding: 20px;
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -80px;
`;

const BigRelease = styled.p`
  padding: 10px 20px;
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -80px;

  span {
    font-weight: 600;
  }
`;

const rowVariants = {
  hidden: {
    x: window.innerWidth + 5, // row 사이의 gap
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.innerWidth - 5,
  },
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      // Box에 바로 transition={{delay: 0.5}} 주면, 커질때/작아질 때 모두 delay가 걸린다.
      delay: 0.5,
      duration: 0.1,
      type: 'tween',
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: 'tween',
    },
  },
};

// Slider에 한 번에 보여주고 싶은 영화 포스터 수
const offset = 6;

const Tv = () => {
  const navigate = useNavigate();

  const bigTvMatch = useMatch('/tvs/:tvId');

  const { scrollY } = useViewportScroll();

  const { data: onTheAirData, isLoading } = useQuery<IGetTvsResult>(
    ['tvs', 'onTheAir'],
    getOnTheAirTvs,
  );

  const { data: airingTodayData } = useQuery<IGetTvsResult>(
    ['tvs', 'airingToday'],
    getAiringTodayTvs,
  );

  const { data: popularData } = useQuery<IGetTvsResult>(
    ['tvs', 'popular'],
    getPopularTvs,
  );

  const { data: topRatedData } = useQuery<IGetTvsResult>(
    ['tvs', 'topRated'],
    getTopRatedTvs,
  );

  const [onTheAirIndex, setOnTheAirIndex] = useState(0);
  const [airingTodayIndex, setAiringTodayIndex] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [topRatedIndex, setTopRatedIndex] = useState(0);

  const increaseOnTheAirIndex = () => {
    if (onTheAirData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalTvs = onTheAirData.results.length - 1;
      const maxIndex = Math.floor(totalTvs / offset) - 1;

      setOnTheAirIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseAiringTodayIndex = () => {
    if (airingTodayData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalTvs = airingTodayData.results.length - 2;
      const maxIndex = Math.floor(totalTvs / offset) - 2;

      setAiringTodayIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increasePopularIndex = () => {
    if (popularData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalTvs = popularData.results.length - 2;
      const maxIndex = Math.floor(totalTvs / offset) - 2;

      setPopularIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseTopRatedIndex = () => {
    if (topRatedData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalTvs = topRatedData.results.length - 2;
      const maxIndex = Math.floor(totalTvs / offset) - 2;

      setTopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  // 슬라이더가 exit되는 동안 또 클릭하면 새로운 row도 exit되려 해서 row 사이의 간격이 크게 벌어지는 버그 수정
  const [leaving, setLeaving] = useState(false);

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClicked = (tvId: string) => {
    navigate(`/tvs/${tvId}`);
  };

  const onOverlayClicked = () => {
    navigate('/tv');
  };

  let clickedTv;
  if (bigTvMatch?.params.tvId) {
    let targetTvId = '';
    let targetData: IGetTvsResult | undefined;

    if (bigTvMatch.params.tvId.startsWith('ontheair')) {
      targetTvId = bigTvMatch.params.tvId.slice('ontheair'.length);
      targetData = onTheAirData;
    } else if (bigTvMatch.params.tvId.startsWith('airingtoday')) {
      targetTvId = bigTvMatch.params.tvId.slice('airingtoday'.length);
      targetData = airingTodayData;
    } else if (bigTvMatch.params.tvId.startsWith('popular')) {
      targetTvId = bigTvMatch.params.tvId.slice('popular'.length);
      targetData = popularData;
    } else if (bigTvMatch.params.tvId.startsWith('toprated')) {
      targetTvId = bigTvMatch.params.tvId.slice('toprated'.length);
      targetData = topRatedData;
    }

    if (targetData) {
      clickedTv = targetData.results.find((tv) => String(tv.id) === targetTvId);
    }
  }

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              onTheAirData?.results[0].backdrop_path || '',
            )}
          >
            <Title>{onTheAirData?.results[0].name}</Title>
            <Overview>{onTheAirData?.results[0].overview}</Overview>
          </Banner>
          <Sliders>
            <Slider>
              <h1>On The Air (Latest)</h1>
              {/* 초기에는 slider 애니메이션 안보여주기 위해 initial={false} 로 처리한다 */}
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                {/* key가 바뀌면 React로 하여금 새로운 Row가 만들어진걸로 인식하게 함. */}
                {/* key가 바뀌면 exit, initial, animate가 다 다시 실행됨 */}
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={onTheAirIndex}
                >
                  {onTheAirData?.results
                    .slice(1)
                    .slice(
                      offset * onTheAirIndex,
                      offset * onTheAirIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'ontheair' + tv.id}
                        onClick={() => onBoxClicked('ontheair' + tv.id)}
                        key={tv.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseOnTheAirIndex}>&gt;</NextButton>
            </Slider>
            <Slider>
              <h1>Airing Today</h1>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={airingTodayIndex}
                >
                  {airingTodayData?.results
                    .slice(
                      offset * airingTodayIndex,
                      offset * airingTodayIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'airingtoday' + tv.id}
                        onClick={() => onBoxClicked('airingtoday' + tv.id)}
                        key={tv.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseAiringTodayIndex}>&gt;</NextButton>
            </Slider>
            <Slider>
              <h1>Popular</h1>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={popularIndex}
                >
                  {popularData?.results
                    .slice(
                      offset * popularIndex,
                      offset * popularIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'popular' + tv.id}
                        onClick={() => onBoxClicked('popular' + tv.id)}
                        key={tv.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increasePopularIndex}>&gt;</NextButton>
            </Slider>
            <Slider>
              <h1>Top Rated</h1>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={topRatedIndex}
                >
                  {topRatedData?.results
                    .slice(
                      offset * topRatedIndex,
                      offset * topRatedIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'toprated' + tv.id}
                        onClick={() => onBoxClicked('toprated' + tv.id)}
                        key={tv.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseTopRatedIndex}>&gt;</NextButton>
            </Slider>
          </Sliders>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigTvMatch.params.tvId}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(
                            ${makeImagePath(clickedTv.backdrop_path, 'w500')})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigScoreWrapper>
                        <BigVote vote={clickedTv.vote_average}>
                          {clickedTv.vote_average}
                        </BigVote>
                        <BigPopularity>
                          Score <span>{clickedTv.popularity}</span> pts
                        </BigPopularity>
                        <BigVoteCount>
                          ({clickedTv.vote_count} votes)
                        </BigVoteCount>
                      </BigScoreWrapper>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                      <BigRelease>
                        First air at <span>{clickedTv.first_air_date}</span>
                      </BigRelease>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
};

export default Tv;
