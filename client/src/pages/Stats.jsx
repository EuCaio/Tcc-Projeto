import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const NOMES = { gram: 'Coloração de Gram', forma: 'Morfologia', doenca: 'Doenças', atb: 'Antibióticos', mec: 'Mecanismos' };

// RF04: acertos e erros por categoria
export default function Stats() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/me/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <p>Carregando...</p>;
  return (
    <>
      <h1 className="text-2xl font-extrabold">Desempenho</h1>
      <p className="text-slate-600 mb-4">Nível {s.nivel} · {s.xp} XP</p>
      {s.porCategoria.length === 0 && <p className="card">Jogue uma rodada para ver suas estatísticas.</p>}
      {s.porCategoria.map((c) => {
        const p = Math.round((c.acertos / c.total) * 100);
        return (
          <div key={c.categoria} className="card">
            <div className="flex justify-between"><b>{NOMES[c.categoria] || c.categoria}</b><span>{c.acertos} acertos · {c.total - c.acertos} erros ({p}%)</span></div>
            <div className="h-2 bg-slate-200 rounded-full mt-2"><div className="h-full bg-acc rounded-full" style={{ width: `${p}%` }} /></div>
          </div>
        );
      })}
      <h2 className="text-xl font-bold mt-6 mb-2">Conquistas</h2>
      <div className="flex flex-wrap gap-2">
        {s.conquistas.length === 0 && <span className="text-slate-600">Nenhuma ainda.</span>}
        {s.conquistas.map((c) => <span key={c.codigo} className="card !mb-0 !py-2">🏅 {c.nome}</span>)}
      </div>
    </>
  );
}
