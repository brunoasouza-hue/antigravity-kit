import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Key, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Header: React.FC<{ title?: string; showBack?: boolean }> = ({ title, showBack }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaMsg, setSenhaMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !novaSenha.trim()) return;

    try {
      await api.put(`/users/${user.id}`, { senha: novaSenha });
      setSenhaMsg('Senha alterada com sucesso!');
      setTimeout(() => {
        setIsSenhaModalOpen(false);
        setNovaSenha('');
        setSenhaMsg('');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar senha.');
    }
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header className="bg-[#EE1D23] text-white shadow-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">

          {/* Left: botão Voltar (só em páginas internas) */}
          <div className="flex items-center shrink-0">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
                title="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Centro: Título da página */}
          {title ? (
            <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase text-center flex-1 truncate">
              {title}
            </h1>
          ) : (
            <div className="flex-1" />
          )}

          {/* Direita: Início + ações */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* ── BOTÃO INÍCIO — sempre visível em todas as páginas ── */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#EE1D23] text-xs font-black shadow-md hover:bg-red-50 transition shrink-0"
              title="Ir para o Painel Principal"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>

            {/* Ações desktop */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="px-3 py-1 rounded-full bg-[#B81419] text-white text-xs font-bold shadow-inner">
                {user?.nome} ({user?.role === 'admin' ? 'Admin' : 'Brigadista'})
              </span>

              <button
                onClick={() => setIsSenhaModalOpen(true)}
                className="px-3 py-1 rounded-full border border-white/60 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Senha</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full border border-white/60 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Alteração de Senha */}
      {isSenhaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setIsSenhaModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#EE1D23] mb-4">Alterar Minha Senha</h3>

            {senhaMsg ? (
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                {senhaMsg}
              </p>
            ) : (
              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#EE1D23] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSenhaModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-bold text-xs shadow-md"
                  >
                    Salvar Nova Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
