import { useEffect, useRef, useState } from 'react';

// Contagem regressiva em segundos até `deadline` (timestamp em ms).
export function useCountdown(deadline, onZero) {
  const [restante, setRestante] = useState(0);
  const cb = useRef(onZero);
  cb.current = onZero;

  useEffect(() => {
    if (!deadline) return;
    const calc = () => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    setRestante(calc());
    const id = setInterval(() => {
      const r = calc();
      setRestante(r);
      if (r === 0) { clearInterval(id); cb.current?.(); }
    }, 250);
    return () => clearInterval(id);
  }, [deadline]);

  return restante;
}
