import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Dados básicos sempre visíveis; extras liberados por nível
export default function Encyclopedia() {
  const [bact, setBact] = useState(null);
  const [atb, setAtb] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([api('/bacteria'), api('/antibiotics')])
      .then(([b, a]) => { setBact(b); setAtb(a); })
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p role="alert" className="text-red-700">{erro}</p>;
  if (!bact) return <p>Carregando...</p>;

  return (
    <>
      <h1 className="text-2xl font-extrabold">Enciclopédia</h1>
      <p className="text-slate-600 mb-4">Você está no nível {bact.nivel}. Jogue para liberar mais conteúdo.</p>
      {bact.itens.map((b) => (
        <div key={b.id} className="card">
          <div className="flex justify-between flex-wrap gap-2">
            <b><i>{b.nome}</i></b>
            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${b.gram.startsWith('Gram-p') ? 'bg-pos' : b.gram.startsWith('Gram-n') ? 'bg-neg' : 'bg-slate-500'}`}>{b.gram}</span>
          </div>
          <p className="text-slate-600 text-sm">{b.morfologia} · {b.doenca} · {b.antibiotico}{b.outros_antibioticos?.length > 0 && ` (também: ${b.outros_antibioticos.join(', ')})`}</p>
          <p className="mt-1">{b.bloqueado ? `🔒 Curiosidade liberada no nível ${b.nivel_desbloqueio}` : b.curiosidade}</p>
        </div>
      ))}
      <h2 className="text-xl font-bold mt-6 mb-2">Antibióticos</h2>
      {atb.itens.map((a) => (
        <div key={a.id} className="card">
          <b>{a.nome}</b> <span className="text-slate-600 text-sm">{a.classe}</span>
          <p>{a.bloqueado ? `🔒 Mecanismo liberado no nível ${a.nivel_desbloqueio}` : a.mecanismo}</p>
        </div>
      ))}
    </>
  );
}
