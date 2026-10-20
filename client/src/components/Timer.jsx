export default function Timer({ restante, total = 15 }) {
  return (
    <div role="progressbar" aria-label="Tempo restante" aria-valuenow={restante} aria-valuemax={total}
         className="h-2 bg-slate-200 rounded-full overflow-hidden my-2">
      <div className="h-full bg-neg transition-all" style={{ width: `${(restante / total) * 100}%` }} />
    </div>
  );
}
