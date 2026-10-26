export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Erro "esperado" (4xx): a mensagem chega ao cliente e não é registrada como falha do servidor.
export const httpError = (status, mensagem) => Object.assign(new Error(mensagem), { status });

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (status >= 500) console.error(err); // erros 4xx são esperados e não poluem o log
  res.status(status).json({ erro: status >= 500 ? 'Erro interno' : err.message });
}
