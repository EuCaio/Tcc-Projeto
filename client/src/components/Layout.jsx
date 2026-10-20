import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';

const abas = [
  ['/', 'Início'], ['/quiz', 'Quiz'], ['/enciclopedia', 'Enciclopédia'],
  ['/desempenho', 'Desempenho'], ['/perfil', 'Perfil'],
];

export default function Layout() {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <main className="max-w-2xl mx-auto p-4 pb-24"><Outlet /></main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex pb-[env(safe-area-inset-bottom)]">
        {abas.map(([to, nome]) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex-1 text-center text-sm py-3 ${isActive ? 'text-acc font-extrabold border-t-4 border-acc' : 'text-slate-500'}`}>
            {nome}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
