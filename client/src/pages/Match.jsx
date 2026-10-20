import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitir, getSocket } from '../socket/index.js';
import { useCountdown } from '../hooks/useTimer.js';
import Timer from '../components/Timer.jsx';

// RF06: lobby da sala, partida multiplayer e placar
export default function Match() {
  const s = getSocket();
  const nav = useNavigate();
  const [sala, setSala] = useState(null);
  const [q, setQ] = useState(null);
  const [placar, setPlacar] = useState(null);
  const [resp, setResp] = useState(null);
  const [fim, setFim] = useState(null);
  const [erro, setErro] = useState('');
  const restante = useCountdown(q?.deadline, () => {});

  useEffect(() => {
    const onRoom = (r) => setSala(r);
    const onQ = (x) => { setQ(x); setPlacar(null); setResp(null); setFim(null); };
    const onScore = (x) => setPlacar(x);
    const onEnd = (x) => { setFim(x); setQ(null); };
    s.on('room:updated', onRoom); s.on('match:question', onQ);
    s.on('match:scoreboard', onScore); s.on('match:finished', onEnd);
    return () => {
      s.off('room:updated', onRoom); s.off('match:question', onQ);
      s.off('match:scoreboard', onScore); s.off('match:finished', onEnd);
    };
  }, [s]);

  const iniciar = () => emitir('match:start').catch((e) => setErro(e.message));
  const sair = async () => { await emitir('room:leave').catch(() => {}); nav('/salas'); };
  const responder = (r) => { if (resp !== null) return; setResp(r); s.emit('match:answer', { resposta: r }); };
  const souHost = sala && sala.hostId === s.id;

  if (fim) return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2">Fim da partida</h2>
      {fim.placar.map((p, n) => <p key={p.id}>{n + 1}º {p.nome} — {p.pontos} pts ({p.acertos} acertos)</p>)}
      <button className="btn mt-3" onClick={sair}>Voltar às salas</button>
    </div>
  );

  if (q) return (
    <div className="card">
      <div className="flex justify-between"><span>Questão {q.index + 1}/{q.total}</span></div>
      <Timer restante={restante} />
      <p className="text-xl font-semibold my-3">{q.enunciado}</p>
      {q.alternativas.map((a) => {
        const cor = placar ? (a === placar.respostaCorreta ? 'border-green-600 bg-green-50' : a === resp ? 'border-red-600 bg-red-50' : '')
          : a === resp ? 'border-acc' : '';
        return <button key={a} className={`opt ${cor}`} disabled={resp !== null || !!placar} onClick={() => responder(a)}>{a}</button>;
      })}
      {placar && placar.placar.map((p) => <p key={p.id}>{p.nome}: {p.pontos} pts</p>)}
    </div>
  );

  if (!sala) return <p>Você não está em uma sala. <button className="text-acc font-semibold" onClick={() => nav('/salas')}>Ir para salas</button></p>;

  return (
    <div className="card">
      <h2 className="text-xl font-bold">Sala {sala.code}</h2>
      <p className="text-slate-600 mb-2">Compartilhe o código com os colegas.</p>
      {sala.jogadores.map((p) => <p key={p.id}>{p.nome}{p.id === sala.hostId ? ' (anfitrião)' : ''}</p>)}
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      <div className="flex gap-2 mt-3">
        {souHost && <button className="btn" onClick={iniciar}>Iniciar partida</button>}
        <button className="btn-alt" onClick={sair}>Sair</button>
      </div>
    </div>
  );
}
