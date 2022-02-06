const API_KEY = '5669791686b40d8fc307979dcfc483ad';
const BASE_PATH = 'https://api.themoviedb.org/3';

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
}

export interface IGetMoviesResult {
  page: number;
  results: [IMovie];
}

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
