import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  Users,
  KeyRound,
  X,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

export const CadastroUsuario: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [role, setRole] = useState<'brigadista' | 'admin'>('brigadista');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [userList, setUserList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [novaSenhaInput, setNovaSenhaInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUserList(res.data);
    } catch (err) {
      console.error('Erro ao buscar lista de usuários:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await api.post('/users', {
        nome,
        email,
        senha,
        role,
        cargo: role === 'admin' ? 'Coordenador Admin' : 'Professor / Inspetor'
      });

      setSuccessMsg(`Usuário ${nome} cadastrado com sucesso!`);
      setNome('');
      setEmail('');
      setSenha('');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao cadastrar novo usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = (u: any) => {
    setResetModalUser(u);
    setNovaSenhaInput('');
    setResetSuccess('');
  };

  const handleConfirmResetSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !novaSenhaInput.trim()) return;

    try {
      await api.put(`/users/${resetModalUser.id}`, { senha: novaSenhaInput.trim() });
      setResetSuccess(`Senha de "${resetModalUser.nome}" redefinida com sucesso!`);
      setTimeout(() => {
        setResetModalUser(null);
        setNovaSenhaInput('');
        setResetSuccess('');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao redefinir senha.');
    }
  };

  const handleDeleteUser = async (id: number, userName: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir o seu próprio usuário conectado.');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="CADASTRO DE USUÁRIOS" showBack />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-4">

        {/* ── Formulário de Cadastro ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#EE1D23] px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Criar Nova Conta</h2>
              <p className="text-[11px] text-white/70 font-medium">Cadastre um novo inspetor no sistema</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[#EE1D23] text-xs font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Nome */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[11px]">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[11px]">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: joao@senai.br"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[11px]">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Crie uma senha forte"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Perfil de Acesso */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[11px]">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('brigadista')}
                    className={`py-2.5 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-extrabold text-xs transition ${
                      role === 'brigadista'
                        ? 'bg-red-50 border-[#EE1D23] text-[#EE1D23]'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Brigadista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2.5 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-extrabold text-xs transition ${
                      role === 'admin'
                        ? 'bg-red-50 border-[#EE1D23] text-[#EE1D23]'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-black text-sm shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Novo Usuário
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Lista de Usuários Cadastrados ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EE1D23]" />
              <h3 className="text-sm font-black text-slate-900">Gerenciar Usuários</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{userList.length} cadastrados</span>
          </div>

          {/* Card Body */}
          <div className="p-4">
            {loadingList ? (
              <div className="py-6 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Carregando lista...
                </div>
              </div>
            ) : userList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-semibold">
                Nenhum usuário cadastrado.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {userList.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-black text-xs ${
                          u.role === 'admin' ? 'bg-[#EE1D23]' : 'bg-slate-600'
                        }`}
                      >
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 text-xs truncate">{u.nome}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-[#EE1D23]'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>

                      <button
                        onClick={() => handleOpenResetModal(u)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 text-[10px] font-bold transition"
                        title="Resetar Senha"
                      >
                        <KeyRound className="w-3 h-3" />
                        Senha
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.nome)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-[#EE1D23] transition"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal Reset de Senha ── */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-black">Redefinir Senha</h3>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
                🔐 Redefinindo senha para:{' '}
                <span className="font-black text-slate-800">{resetModalUser.nome}</span>
                <br />
                <span className="text-[11px]">{resetModalUser.email}</span>
              </p>

              {resetSuccess ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {resetSuccess}
                </div>
              ) : (
                <form onSubmit={handleConfirmResetSenha} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={novaSenhaInput}
                      onChange={(e) => setNovaSenhaInput(e.target.value)}
                      placeholder="Digite a nova senha..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setResetModalUser(null)}
                      className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
                    >
                      Confirmar Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
