import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';
import { fecharSocket } from '../socket/index.js';

export default function Profile() {
  const { usuario, sair } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <h1 className="text-2xl font-extrabold mb-4">Perfil</h1>
      <div className="card">
        <p><b>{usuario?.nome}</b> · {usuario?.papel}</p>
        <p className="text-slate-600">{usuario?.email}</p>
        <p className="my-2">Nível {usuario?.nivel} · {usuario?.xp} XP</p>
        <button className="btn-alt" onClick={() => { fecharSocket(); sair(); nav('/login'); }}>Sair</button>
      </div>
    </>
  );
}
