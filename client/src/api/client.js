import { useAuth } from '../store/auth.js';

export async function api(caminho, { method = 'GET', body } = {}) {
  const { token, sair } = useAuth.getState();
  const res = await fetch(`/api${caminho}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const dados = await res.json().catch(() => ({}));
  if (res.status === 401 && token) sair();
  if (!res.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}
