// Dados básicos sempre visíveis; extras liberados por nível.
export function filtrarBacteria(b, nivel) {
  const liberado = nivel >= b.nivel_desbloqueio;
  return { ...b, curiosidade: liberado ? b.curiosidade : null, bloqueado: !liberado };
}

export function filtrarAntibiotico(a, nivel) {
  const liberado = nivel >= a.nivel_desbloqueio;
  return { ...a, mecanismo: liberado ? a.mecanismo : null, bloqueado: !liberado };
}
