import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../store/auth.js';
import { useCountdown } from '../hooks/useTimer.js';
import Timer from '../components/Timer.jsx';

// Quiz solo contra o tempo
export default function Quiz() {
  const [rodada, setRodada] = useState(null);
  const [i, setI] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [fb, setFb] = useState(null);
  const [total, setTotal] = useState({ acertos: 0, pontos: 0, conquistas: [] });
  const [fim, setFim] = useState(false);
  const [erro, setErro] = useState('');
  const entrar = useAuth((s) => s.entrar);
  const { token, usuario } = useAuth();

  const iniciar = useCallback(async () => {
    setErro(''); setFim(false); setI(0); setFb(null);
    setTotal({ acertos: 0, pontos: 0, conquistas: [] });
    try {
      const r = await api('/questions/round?n=10');
      setRodada(r); setDeadline(Date.now() + 15000);
    } catch (e) { setErro(e.message); }
  }, []);
  useEffect(() => { iniciar(); }, [iniciar]);

  async function responder(resposta) {
    if (fb) return;
    const tempoMs = 15000 - Math.max(0, deadline - Date.now());
    try {
      const r = await api('/answers', { method: 'POST', body: { roundId: rodada.roundId, index: i, resposta, tempoMs } });
      setFb({ ...r, escolhida: resposta });
      setTotal((t) => ({ acertos: t.acertos + (r.correta ? 1 : 0), pontos: t.pontos + r.pontos, conquistas: [...t.conquistas, ...r.novasConquistas] }));
      entrar(token, { ...usuario, xp: r.xp, nivel: r.nivel });
      setDeadline(0);
      setTimeout(() => {
        if (i + 1 >= rodada.questoes.length) setFim(true);
        else { setI(i + 1); setFb(null); setDeadline(Date.now() + 15000); }
      }, 1500);
    } catch (e) { setErro(e.message); }
  }

  const restante = useCountdown(deadline, () => responder(null));

  if (erro) return <p role="alert" className="text-red-700">{erro}</p>;
  if (!rodada) return <p>Carregando...</p>;
  if (fim) return (
    <div className="card">
      <h2 className="text-xl font-bold">Rodada concluída</h2>
      <p className="my-2">{total.acertos} de {rodada.questoes.length} acertos · +{total.pontos} XP</p>
      {total.conquistas.length > 0 && <p className="mb-2">Conquistas: {total.conquistas.join(', ')}</p>}
      <button className="btn" onClick={iniciar}>Jogar de novo</button>
    </div>
  );

  const q = rodada.questoes[i];
  return (
    <div className="card">
      <div className="flex justify-between"><span>Questão {i + 1}/{rodada.questoes.length}</span><span>{total.pontos} pts</span></div>
      <Timer restante={restante} />
      <p className="text-xl font-semibold my-3">{q.enunciado}</p>
      {q.alternativas.map((a) => {
        const cor = fb ? (a === fb.respostaCorreta ? 'border-green-600 bg-green-50' : a === fb.escolhida ? 'border-red-600 bg-red-50' : '') : '';
        return <button key={a} className={`opt ${cor}`} disabled={!!fb} onClick={() => responder(a)}>{a}</button>;
      })}
      {fb && <p className="font-bold">{fb.correta ? 'Correto.' : 'Incorreto.'} Resposta: {fb.respostaCorreta}</p>}
    </div>
  );
}
