import { AnimatePresence, motion, useViewportScroll } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  IGetMoviesResult,
  IGetTvsResult,
  searchMovies,
  searchTvs,
} from '../api';
import { makeImagePath } from '../utils';

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 60px;
`;

const Title = styled.h2`
  font-size: 40px;
  margin-top: 100px;
`;

const Sliders = styled.div`
  display: flex;
  flex-direction: column;
`;

const Slider = styled.div`
  position: relative;
  margin-top: 20px;

  &:last-child {
    margin-top: 232px;
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

const Search = () => {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get('keyword');

  const navigate = useNavigate();

  const bigMovieMatch = useMatch('/search/movies/:movieId');
  const bigTvMatch = useMatch('/search/tvs/:tvId');

  const { scrollY } = useViewportScroll();

  const { data: movieData, isLoading: isMovieLoading } =
    useQuery<IGetMoviesResult>(['movies', 'search', keyword], () =>
      searchMovies(keyword || ''),
    );

  const { data: tvData, isLoading: isTvLoading } = useQuery<IGetTvsResult>(
    ['tvs', 'search', keyword],
    () => searchTvs(keyword || ''),
  );

  const [movieIndex, setMovieIndex] = useState(0);
  const [tvIndex, setTvIndex] = useState(0);

  const increaseMovieIndex = () => {
    if (movieData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalMovies = movieData.results.length;
      const maxIndex = Math.floor(totalMovies / offset);

      setMovieIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseTvIndex = () => {
    if (tvData) {
      if (leaving) {
        return;
      }
      toggleLeaving();

      const totalTvs = tvData.results.length;
      const maxIndex = Math.floor(totalTvs / offset);

      setTvIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const [leaving, setLeaving] = useState(false);

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onMovieBoxClicked = (movieId: number) => {
    navigate(`/search/movies/${movieId}?keyword=${keyword}`);
  };
  const onTvBoxClicked = (tvId: number) => {
    navigate(`/search/tvs/${tvId}?keyword=${keyword}`);
  };

  const onOverlayClicked = () => {
    navigate(`/search?keyword=${keyword}`);
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    movieData?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId,
    );

  const clickedTv =
    bigTvMatch?.params.tvId &&
    tvData?.results.find((tv) => String(tv.id) === bigTvMatch.params.tvId);

  return (
    <Wrapper>
      {isMovieLoading && isTvLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner>
            <Title>Search results for &apos;{keyword}&apos;</Title>
          </Banner>
          <Sliders>
            <Slider>
              <h1>
                📽️&nbsp;
                {movieData?.results && movieData?.results.length > 0
                  ? 'Movie search results'
                  : 'No movie results'}
              </h1>
              {movieData?.results && movieData?.results.length > 0 ? (
                <>
                  <AnimatePresence
                    initial={false}
                    onExitComplete={toggleLeaving}
                  >
                    <Row
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ type: 'tween', duration: 1 }}
                      key={movieIndex}
                    >
                      {movieData?.results
                        .slice(
                          offset * movieIndex,
                          offset * movieIndex + offset,
                        )
                        .map((movie) => (
                          <Box
                            layoutId={movie.id + ''}
                            onClick={() => onMovieBoxClicked(movie.id)}
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
                  <NextButton onClick={increaseMovieIndex}>&gt;</NextButton>
                </>
              ) : null}
            </Slider>
            <Slider>
              <h1>
                📺&nbsp;
                {tvData?.results && tvData?.results.length > 0
                  ? 'TV search results'
                  : 'No tv results'}
              </h1>
              {tvData?.results && tvData?.results.length > 0 ? (
                <>
                  <AnimatePresence
                    initial={false}
                    onExitComplete={toggleLeaving}
                  >
                    <Row
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ type: 'tween', duration: 1 }}
                      key={tvIndex}
                    >
                      {tvData?.results
                        .slice(offset * tvIndex, offset * tvIndex + offset)
                        .map((tv) => (
                          <Box
                            layoutId={tv.id + ''}
                            onClick={() => onTvBoxClicked(tv.id)}
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
                  <NextButton onClick={increaseTvIndex}>&gt;</NextButton>
                </>
              ) : null}
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
                      <BigScoreWrapper>
                        <BigVote vote={clickedMovie.vote_average}>
                          {clickedMovie.vote_average}
                        </BigVote>
                        <BigPopularity>
                          Score <span>{clickedMovie.popularity}</span> pts
                        </BigPopularity>
                        <BigVoteCount>
                          ({clickedMovie.vote_count} votes)
                        </BigVoteCount>
                      </BigScoreWrapper>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      <BigRelease>
                        Released at <span>{clickedMovie.release_date}</span>
                      </BigRelease>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
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
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
};

export default Search;
