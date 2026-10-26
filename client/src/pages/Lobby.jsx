import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitir, getSocket } from '../socket/index.js';

// Criar ou entrar em sala
export default function Lobby() {
  const [code, setCode] = useState('');
  const [erro, setErro] = useState('');
  const nav = useNavigate();

  useEffect(() => { getSocket(); }, []);

  const ir = async (evento, dados) => {
    setErro('');
    try { await emitir(evento, dados); nav('/partida'); }
    catch (e) { setErro(e.message); }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold mb-4">Salas</h1>
      <div className="card">
        <button className="btn" onClick={() => ir('room:create')}>Criar sala</button>
      </div>
      <div className="card">
        <label>Código da sala
          <input className="input uppercase" maxLength={4} value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        <button className="btn mt-2" disabled={code.length < 4} onClick={() => ir('room:join', { code })}>Entrar</button>
      </div>
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
    </>
  );
}
