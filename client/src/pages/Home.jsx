import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth.js';

export default function Home() {
  const u = useAuth((s) => s.usuario);
  return (
    <>
      <h1 className="text-2xl font-extrabold">Olá, {u?.nome}</h1>
      <p className="text-slate-600 mb-4">Nível {u?.nivel} · {u?.xp} XP</p>
      <div className="card">
        <h2 className="font-bold text-lg">Quiz contra o tempo</h2>
        <p className="mb-3">10 questões, 15 segundos cada.</p>
        <Link to="/quiz" className="btn inline-block">Começar</Link>
      </div>
      <div className="card">
        <h2 className="font-bold text-lg">Modo 1v1 e salas</h2>
        <p className="mb-3">Crie uma sala e desafie colegas em tempo real.</p>
        <Link to="/salas" className="btn inline-block">Abrir salas</Link>
      </div>
    </>
  );
}
