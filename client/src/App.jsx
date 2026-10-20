import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Quiz from './pages/Quiz.jsx';
import Encyclopedia from './pages/Encyclopedia.jsx';
import Stats from './pages/Stats.jsx';
import Profile from './pages/Profile.jsx';
import Lobby from './pages/Lobby.jsx';
import Match from './pages/Match.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/enciclopedia" element={<Encyclopedia />} />
        <Route path="/desempenho" element={<Stats />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/salas" element={<Lobby />} />
        <Route path="/partida" element={<Match />} />
      </Route>
    </Routes>
  );
}
