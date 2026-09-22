import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('bruno.souza@sp.senai.br');
  const [senha, setSenha] = useState('senai123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setAdminDemo = () => {
    setEmail('bruno.souza@sp.senai.br');
    setSenha('senai123');
  };

  const setBrigadistaDemo = () => {
    setEmail('brigadista@sp.senai.br');
    setSenha('senai123');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans">
      {/* Red Header Bar */}
      <header className="bg-[#EE1D23] text-white py-4 px-6 shadow-md text-center">
        <h1 className="text-xl font-black uppercase tracking-wider">Gestão de Ativos - SENAI</h1>
        <p className="text-xs font-semibold text-white/80">Inspeção de Equipamentos da Brigada</p>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-md border border-slate-100 relative">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-[#EE1D23] mb-3">
              <Flame className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Acesso ao Sistema</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Insira suas credenciais de usuário</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-600 text-xs font-bold">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@sp.senai.br"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#EE1D23] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#EE1D23] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-black text-sm shadow-md shadow-red-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Filler Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 text-center mb-3">
              Acesso Rápido de Demonstração:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={setAdminDemo}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition"
              >
                <div className="font-extrabold text-[#EE1D23] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Administrador
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">bruno.souza@sp.senai.br</p>
              </button>

              <button
                type="button"
                onClick={setBrigadistaDemo}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition"
              >
                <div className="font-extrabold text-[#1E73BE] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Brigadista
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">brigadista@sp.senai.br</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 SENAI - Gestão de Ativos
      </footer>
    </div>
  );
};
