import { useLocation } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get('keyword');

  // TODO: 검색
  // https://developers.themoviedb.org/3/search/search-movies
  // https://developers.themoviedb.org/3/search/search-tv-shows

  // TODO: multi search 써서 movie, tv, 사람 검색 결과 나눠서 슬라이더로 보여주자

  return null;
};

export default Search;
