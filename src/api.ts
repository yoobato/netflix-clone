const API_KEY = '5669791686b40d8fc307979dcfc483ad';
const BASE_PATH = 'https://api.themoviedb.org/3';

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  release_date: string;
  popularity: number;
  vote_count: number;
  vote_average: number;
}

export interface IGetMoviesResult {
  page: number;
  results: [IMovie];
}

interface ITv {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  overview: string;
  first_air_date: string;
  popularity: number;
  vote_count: number;
  vote_average: number;
}

export interface IGetTvsResult {
  page: number;
  results: [ITv];
}

// Latest
export const getNowPlyaingMovies = () => {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const getTopRatedMovies = () => {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const getUpcomingMovies = () => {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const searchMovies = (keyword: string) => {
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}`,
  ).then((response) => response.json());
};

// Latest
export const getOnTheAirTvs = () => {
  return fetch(`${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const getAiringTodayTvs = () => {
  return fetch(`${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const getPopularTvs = () => {
  return fetch(`${BASE_PATH}/tv/popular?api_key=${API_KEY}`).then((response) =>
    response.json(),
  );
};

export const getTopRatedTvs = () => {
  return fetch(`${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json(),
  );
};

export const searchTvs = (keyword: string) => {
  return fetch(
    `${BASE_PATH}/search/tv?api_key=${API_KEY}&query=${keyword}`,
  ).then((response) => response.json());
};
