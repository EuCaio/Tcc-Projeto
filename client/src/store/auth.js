import { create } from 'zustand';

const lido = () => {
  try { return JSON.parse(localStorage.getItem('bq-auth')) || {}; } catch { return {}; }
};

export const useAuth = create((set) => ({
  token: lido().token || null,
  usuario: lido().usuario || null,
  entrar: (token, usuario) => {
    try { localStorage.setItem('bq-auth', JSON.stringify({ token, usuario })); } catch {}
    set({ token, usuario });
  },
  sair: () => {
    try { localStorage.removeItem('bq-auth'); } catch {}
    set({ token: null, usuario: null });
  },
}));
