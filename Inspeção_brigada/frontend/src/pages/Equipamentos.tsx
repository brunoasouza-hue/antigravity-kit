import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  PlusCircle, 
  XCircle, 
  X,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

interface Equipamento {
  id: number;
  codigo: string;
  tipo: string;
  subtipo: string;
  capacidade: string;
  setor: string;
  localizacao_detalhada: string;
  status_geral: string;
}

export const Equipamentos: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Modal Novo Equipamento State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCodigo, setFormCodigo] = useState('');
  const [formTipo, setFormTipo] = useState('extintor');
  const [formSubtipo, setFormSubtipo] = useState('Água Pressurizada');
  const [formSetor, setFormSetor] = useState('BLOCO A - RECEPÇÃO EXTERNA');
  const [formCapacidade, setFormCapacidade] = useState('10L');

  useEffect(() => {
    fetchEquipamentos();
  }, [busca]);

  const fetchEquipamentos = async () => {
    try {
      const res = await api.get('/equipamentos', {
        params: { busca }
      });
      setEquipamentos(res.data);
    } catch (err) {
      console.error('Erro ao buscar inventário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipamento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/equipamentos', {
        codigo: formCodigo,
        tipo: formTipo,
        subtipo: formSubtipo,
        setor: formSetor,
        localizacao_detalhada: formSetor,
        capacidade: formCapacidade
      });
      setIsModalOpen(false);
      fetchEquipamentos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cadastrar equipamento.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, codigo: string) => {
    e.stopPropagation();
    if (!window.confirm(`Excluir o equipamento ${codigo}?`)) return;

    try {
      await api.delete(`/equipamentos/${id}`);
      fetchEquipamentos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir equipamento.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="INVENTÁRIO COMPLETO" showBack />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Action Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Search Pill Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#EE1D23] shadow-xs font-semibold"
            />
          </div>

          {/* Histórico Button */}
          <button
            onClick={() => navigate('/historico')}
            className="px-4 py-2.5 rounded-full bg-[#EFEFEF] hover:bg-[#E2E2E2] text-slate-700 text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Histórico</span>
          </button>

          {/* Exportar Button */}
          <button
            onClick={() => navigate('/relatorios')}
            className="px-4 py-2.5 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-md shadow-red-500/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>

        {/* Big Green Add Equipment Button */}
        {isAdmin && (
          <button
            onClick={() => {
              setFormCodigo(`A0${equipamentos.length + 2}`);
              setIsModalOpen(true);
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#28A745] hover:bg-[#218838] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Cadastrar Novo Equipamento</span>
          </button>
        )}

        {/* Equipment List Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs">Carregando inventário...</div>
        ) : (
          <div className="space-y-3">
            {equipamentos.map((item) => {
              const subtipoUpper = (item.subtipo || item.tipo).toUpperCase();
              const badgeLabel = subtipoUpper.includes('CO2')
                ? 'CO2'
                : subtipoUpper.includes('PÓ') || subtipoUpper.includes('ABC')
                ? 'PÓ ABC'
                : subtipoUpper.includes('ÁGUA')
                ? 'ÁGUA'
                : item.tipo.toUpperCase();

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/ficha/${item.codigo}`)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div>
                    {/* Code in Red */}
                    <h3 className="text-lg font-black text-[#EE1D23] leading-none">{item.codigo}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{item.subtipo || item.tipo}</p>
                    <p className="text-xs text-slate-700 font-bold uppercase mt-0.5">{item.setor}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-[11px] font-extrabold tracking-wider">
                      {badgeLabel}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, item.id, item.codigo)}
                        className="text-red-400 hover:text-red-600 p-1 transition"
                        title="Remover Equipamento"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Novo Equipamento */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-[#EE1D23] mb-4">Cadastrar Novo Equipamento</h3>

              <form onSubmit={handleCreateEquipamento} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase">Código (Ex: A02, HID-01)</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:border-[#EE1D23]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase">Tipo</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="extintor">Extintor de Incêndio</option>
                    <option value="hidrante">Hidrante / Abrigo</option>
                    <option value="saida_emergencia">Saída de Emergência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase">Subtipo (Ex: Água Pressurizada, CO2)</label>
                  <input
                    type="text"
                    value={formSubtipo}
                    onChange={(e) => setFormSubtipo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase">Localização / Setor</label>
                  <input
                    type="text"
                    required
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#28A745] hover:bg-[#218838] text-white font-bold shadow-md"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 SENAI - Gestão de Ativos
      </footer>
    </div>
  );
};
