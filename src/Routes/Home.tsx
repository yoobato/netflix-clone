import { AnimatePresence, motion, useViewportScroll } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getNowPlyaingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  IGetMoviesResult,
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

const BigMovie = styled(motion.div)`
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

const BigOverview = styled.p`
  padding: 20px;
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -80px;
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

const Home = () => {
  const navigate = useNavigate();

  const bigMovieMatch = useMatch('/movies/:movieId');

  const { scrollY } = useViewportScroll();

  const { data: nowPlayingData, isLoading } = useQuery<IGetMoviesResult>(
    ['movies', 'nowPlaying'],
    getNowPlyaingMovies,
  );

  const { data: topRatedData } = useQuery<IGetMoviesResult>(
    ['movies', 'topRated'],
    getTopRatedMovies,
  );

  const { data: upcomingData } = useQuery<IGetMoviesResult>(
    ['movies', 'upcoming'],
    getUpcomingMovies,
  );

  const [nowPlayingIndex, setNowPlayingIndex] = useState(0);
  const [topRatedIndex, setTopRatedIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  const increaseNowPlayingIndex = () => {
    if (nowPlayingData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalMovies = nowPlayingData.results.length - 1; // 배경으로 사용하는 영화 1개 제외
      const maxIndex = Math.floor(totalMovies / offset) - 1; // 슬라이더에 항상 row가 가득차도록 floor 사용.

      setNowPlayingIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseTopRatedIndex = () => {
    if (topRatedData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalMovies = topRatedData.results.length - 2;
      const maxIndex = Math.floor(totalMovies / offset) - 2;

      setTopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseUpcomingIndex = () => {
    if (upcomingData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalMovies = upcomingData.results.length - 2;
      const maxIndex = Math.floor(totalMovies / offset) - 2;

      setUpcomingIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  // 슬라이더가 exit되는 동안 또 클릭하면 새로운 row도 exit되려 해서 row 사이의 간격이 크게 벌어지는 버그 수정
  const [leaving, setLeaving] = useState(false);

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClicked = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  const onOverlayClicked = () => {
    navigate('/');
  };

  // bigMovieMath.params.movieId 값이 있으면 뒤의 값(movie)이 됨.
  let clickedMovie;
  if (bigMovieMatch?.params.movieId) {
    let targetMovieId = '';
    let targetData: IGetMoviesResult | undefined;

    if (bigMovieMatch.params.movieId.startsWith('nowplaying')) {
      targetMovieId = bigMovieMatch.params.movieId.slice('nowplaying'.length);
      targetData = nowPlayingData;
    } else if (bigMovieMatch.params.movieId.startsWith('toprated')) {
      targetMovieId = bigMovieMatch.params.movieId.slice('toprated'.length);
      targetData = topRatedData;
    } else if (bigMovieMatch.params.movieId.startsWith('upcoming')) {
      targetMovieId = bigMovieMatch.params.movieId.slice('upcoming'.length);
      targetData = upcomingData;
    }

    if (targetData) {
      clickedMovie = targetData.results.find(
        (movie) => String(movie.id) === targetMovieId,
      );
    }
  }

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          {/* 뒤에 || '' 은 fallback임. data가 null 이면 그냥 empty string으로 사용 */}
          <Banner
            bgPhoto={makeImagePath(
              nowPlayingData?.results[0].backdrop_path || '',
            )}
          >
            <Title>{nowPlayingData?.results[0].title}</Title>
            <Overview>{nowPlayingData?.results[0].overview}</Overview>
          </Banner>
          <Sliders>
            <Slider>
              <h1>Now Playing</h1>
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
                  key={nowPlayingIndex}
                >
                  {nowPlayingData?.results
                    .slice(1)
                    .slice(
                      offset * nowPlayingIndex,
                      offset * nowPlayingIndex + offset,
                    )
                    .map((movie) => (
                      <Box
                        layoutId={'nowplaying' + movie.id}
                        onClick={() => onBoxClicked('nowplaying' + movie.id)}
                        key={movie.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(movie.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseNowPlayingIndex}>&gt;</NextButton>
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
                    .map((movie) => (
                      <Box
                        layoutId={'toprated' + movie.id}
                        onClick={() => onBoxClicked('toprated' + movie.id)}
                        key={movie.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(movie.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseTopRatedIndex}>&gt;</NextButton>
            </Slider>
            <Slider>
              <h1>Upcoming</h1>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={upcomingIndex}
                >
                  {upcomingData?.results
                    .slice(
                      offset * upcomingIndex,
                      offset * upcomingIndex + offset,
                    )
                    .map((movie) => (
                      <Box
                        layoutId={'upcoming' + movie.id}
                        onClick={() => onBoxClicked('upcoming' + movie.id)}
                        key={movie.id}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: 'tween' }}
                        bgPhoto={makeImagePath(movie.backdrop_path, 'w500')}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <NextButton onClick={increaseUpcomingIndex}>&gt;</NextButton>
            </Slider>
          </Sliders>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(
                            ${makeImagePath(
                              clickedMovie.backdrop_path,
                              'w500',
                            )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      {/* TODO: Movie modal 예쁘게 꾸미자 */}
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
};

export default Home;
