import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Home from './Routes/Home';
import Search from './Routes/Search';
import Tv from './Routes/Tv';

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Header />
      <Routes>
        <Route path="/tv" element={<Tv />} />
        <Route path="/search" element={<Search />} />

        {/* TODO: react-router-dom v6에서는 path array가 안된다? */}
        <Route path="movies/:movieId" element={<Home />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
