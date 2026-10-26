import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../store/auth.js';

// Cadastro e login
export default function Login() {
  const [modo, setModo] = useState('login');
  const [f, setF] = useState({ nome: '', email: '', senha: '', papel: 'aluno' });
  const [erro, setErro] = useState('');
  const entrar = useAuth((s) => s.entrar);
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    try {
      const r = await api(modo === 'login' ? '/auth/login' : '/auth/register', { method: 'POST', body: f });
      entrar(r.token, r.usuario);
      nav('/');
    } catch (err) { setErro(err.message); }
  }

  return (
    <main className="max-w-md mx-auto p-4 pt-12">
      <h1 className="text-3xl font-extrabold">BacterioQuest</h1>
      <p className="text-slate-600 mb-6">Aprenda bacteriologia jogando.</p>
      <form onSubmit={enviar} className="card">
        {modo === 'cadastro' && (
          <>
            <label>Nome<input className="input" value={f.nome} onChange={set('nome')} required /></label>
            <label>Papel
              <select className="input" value={f.papel} onChange={set('papel')}>
                <option value="aluno">Estudante</option><option value="professor">Professor</option><option value="outro">Outro</option>
              </select>
            </label>
          </>
        )}
        <label>E-mail<input className="input" type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Senha<input className="input" type="password" value={f.senha} onChange={set('senha')} minLength={6} required /></label>
        {erro && <p role="alert" className="text-red-700 my-2">{erro}</p>}
        <button className="btn w-full mt-3">{modo === 'login' ? 'Entrar' : 'Criar conta'}</button>
        <button type="button" className="w-full mt-3 text-acc font-semibold"
          onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}>
          {modo === 'login' ? 'Não tenho conta' : 'Já tenho conta'}
        </button>
      </form>
    </main>
  );
}
