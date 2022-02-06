import { AnimatePresence, motion, useViewportScroll } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMovies, IGetMoviesResult } from '../api';
import { makeImagePath } from '../utils';

const Wrapper = styled.div`
  backgroundcolor: black;
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

// TODO: position이 relative인꺼 안에 absolute가 있으면 어떤 효과지?
const Slider = styled.div`
  position: relative;
  top: -100px;
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

  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ['movies', 'nowPlaying'],
    getMovies,
  );

  const [index, setIndex] = useState(0);
  const increaseIndex = () => {
    if (data) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalMovies = data.results.length - 1; // 배경으로 사용하는 영화 1개 제외
      const maxIndex = Math.floor(totalMovies / offset) - 1; // 슬라이더에 항상 row가 가득차도록 floor 사용.

      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  // 슬라이더가 exit되는 동안 또 클릭하면 새로운 row도 exit되려 해서 row 사이의 간격이 크게 벌어지는 버그 수정
  const [leaving, setLeaving] = useState(false);

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClicked = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const onOverlayClicked = () => {
    navigate('/');
  };

  // bigMovieMath.params.movieId 값이 있으면 뒤의 값(movie)이 됨.
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId,
    );

  // TODO: 슬라이더 여러개 추가 (현재는 now playing만 보여줌)

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          {/* 뒤에 || '' 은 fallback임. data가 null 이면 그냥 empty string으로 사용 */}
          <Banner
            onClick={increaseIndex}
            bgPhoto={makeImagePath(data?.results[0].backdrop_path || '')}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
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
                key={index}
              >
                {/* 맨 처음 데이터는 배경에 사용하므로 제거한다 */}
                {/* 데이터를 6개씩 잘라서 보여준다 */}
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ''} // movie.id가 number인데 이걸 string으로 바꿔준다.
                      onClick={() => onBoxClicked(movie.id)}
                      key={movie.id}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: 'tween' }}
                      bgPhoto={makeImagePath(movie.backdrop_path, 'w500')}
                    >
                      {/* whileHover 안써줘도 된다. (부모로부터 이름이 상속됨) */}
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
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
