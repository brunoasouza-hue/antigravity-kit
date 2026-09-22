import React, { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  Edit3,
  Search,
  X,
  KeyRound,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

interface UserItem {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'brigadista';
  cargo: string;
  ativo: number;
  created_at: string;
}

type ModalType = 'create' | 'edit' | 'reset' | null;

export const Usuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal Estados
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form Estados
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'brigadista'>('brigadista');
  const [formCargo, setFormCargo] = useState('Inspetor da Brigada');
  const [formAtivo, setFormAtivo] = useState(true);

  // Reset senha
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetUserNome, setResetUserNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      setErrorMsg('Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingUser(null);
    setErrorMsg('');
    setSuccessMsg('');
    setNovaSenha('');
    setConfirmSenha('');
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setFormRole('brigadista');
    setFormCargo('Inspetor da Brigada');
    setFormAtivo(true);
    setErrorMsg('');
    setModalType('create');
  };

  const handleOpenEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormNome(u.nome);
    setFormEmail(u.email);
    setFormSenha('');
    setFormRole(u.role);
    setFormCargo(u.cargo || '');
    setFormAtivo(u.ativo === 1);
    setErrorMsg('');
    setModalType('edit');
  };

  const handleOpenResetModal = (u: UserItem) => {
    setResetUserId(u.id);
    setResetUserNome(u.nome);
    setNovaSenha('');
    setConfirmSenha('');
    setErrorMsg('');
    setSuccessMsg('');
    setModalType('reset');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          nome: formNome,
          role: formRole,
          cargo: formCargo,
          ativo: formAtivo,
          senha: formSenha || undefined
        });
        setSuccessMsg(`Usuário ${formNome} atualizado com sucesso!`);
      } else {
        await api.post('/users', {
          nome: formNome,
          email: formEmail,
          senha: formSenha,
          role: formRole,
          cargo: formCargo
        });
        setSuccessMsg(`Usuário ${formNome} cadastrado com sucesso!`);
      }

      setTimeout(() => {
        closeModal();
        fetchUsers();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar informações do usuário.');
    }
  };

  const handleResetSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!novaSenha || novaSenha.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (novaSenha !== confirmSenha) {
      setErrorMsg('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    try {
      await api.put(`/users/${resetUserId}`, { senha: novaSenha });
      setSuccessMsg(`Senha de "${resetUserNome}" redefinida com sucesso!`);
      setTimeout(() => {
        closeModal();
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao redefinir a senha.');
    }
  };

  const handleDeleteUser = async (id: number, nome: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir a sua própria conta conectada.');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      setSuccessMsg(`Usuário ${nome} excluído com sucesso!`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.cargo?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalAdmin = users.filter((u) => u.role === 'admin').length;
  const totalBrigadista = users.filter((u) => u.role === 'brigadista').length;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="GESTÃO DE USUÁRIOS" showBack />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-4">

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-[#EE1D23] mb-1">
              <UsersIcon className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-slate-900">{users.length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-[#EE1D23] mb-1">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-[#EE1D23]">{totalAdmin}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Admins</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-slate-700">{totalBrigadista}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Brigadistas</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900">Usuários Cadastrados</h2>
            <p className="text-xs text-slate-500 font-medium">Controle de acesso e privilégios</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 shrink-0 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && !modalType && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[#EE1D23] text-xs font-bold">
            <XCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cargo..."
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#EE1D23] font-semibold shadow-sm"
          />
        </div>

        {/* User List Cards */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Carregando usuários...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-black text-base shadow-sm ${
                        u.role === 'admin' ? 'bg-[#EE1D23]' : 'bg-slate-700'
                      }`}
                    >
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm">{u.nome}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-red-100 text-[#EE1D23]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Brigadista'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{u.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{u.cargo || 'Brigadista'}</p>
                    </div>
                  </div>

                  {/* Edit + Delete icons (top right) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition"
                      title="Editar Usuário"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.nome)}
                      disabled={u.id === currentUser?.id}
                      className="p-2 rounded-xl hover:bg-red-50 text-[#EE1D23] disabled:opacity-30 transition"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Divider + Status + Reset Senha */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenResetModal(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 text-[11px] font-bold transition"
                  >
                    <KeyRound className="w-3 h-3" />
                    Redefinir Senha
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.ativo === 1
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.ativo === 1 ? '● Ativo' : '○ Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ───── MODAL CRIAR / EDITAR USUÁRIO ───── */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#EE1D23] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-black">
                  {modalType === 'edit' ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {successMsg && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#EE1D23] text-xs font-bold">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>

                {modalType === 'create' && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@senai.br"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 transition"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Privilégio</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as 'admin' | 'brigadista')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold outline-none focus:border-[#EE1D23] transition"
                    >
                      <option value="brigadista">Brigadista</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Status</label>
                    <select
                      value={formAtivo ? '1' : '0'}
                      onChange={(e) => setFormAtivo(e.target.value === '1')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold outline-none focus:border-[#EE1D23] transition"
                    >
                      <option value="1">Ativo</option>
                      <option value="0">Inativo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Cargo / Função</label>
                  <input
                    type="text"
                    value={formCargo}
                    onChange={(e) => setFormCargo(e.target.value)}
                    placeholder="Ex: Inspetor da Brigada"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">
                    {modalType === 'edit' ? 'Nova Senha (opcional)' : 'Senha de Acesso'}
                  </label>
                  <input
                    type="password"
                    required={modalType === 'create'}
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                    placeholder={modalType === 'edit' ? 'Deixe em branco para manter' : 'Mínimo 4 caracteres'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-[#EE1D23] focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-bold shadow-md shadow-red-500/20 transition"
                  >
                    {modalType === 'edit' ? 'Salvar Alterações' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ───── MODAL RESET DE SENHA ───── */}
      {modalType === 'reset' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-black">Redefinir Senha</h3>
              </div>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-xs font-semibold text-slate-500 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                🔐 Redefinindo senha para: <span className="font-black text-slate-800">{resetUserNome}</span>
              </p>

              {successMsg ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              ) : (
                <form onSubmit={handleResetSenha} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[#EE1D23] text-xs font-bold">
                      <XCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide">Confirmar Senha</label>
                    <input
                      type="password"
                      required
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold outline-none transition ${
                        confirmSenha && novaSenha !== confirmSenha
                          ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                          : confirmSenha && novaSenha === confirmSenha
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                          : 'border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                      }`}
                    />
                    {confirmSenha && novaSenha !== confirmSenha && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">As senhas não coincidem</p>
                    )}
                    {confirmSenha && novaSenha === confirmSenha && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Senhas conferem</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition"
                    >
                      Redefinir Senha
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
