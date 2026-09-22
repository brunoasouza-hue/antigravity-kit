import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import api from '../services/api';
import { Header } from '../components/Header';

interface VistoriaItem {
  id: number;
  data_vistoria: string;
  status_result: string;
  pressao_ok: number;
  lacre_ok: number;
  sinalizacao_ok: number;
  desobstruido_ok: number;
  validade_ok: number;
  observacoes: string;
  inspetor_nome: string;
  equipamento_codigo: string;
  equipamento_tipo: string;
  equipamento_subtipo: string;
  equipamento_setor: string;
}

export const HistoricoVistorias: React.FC = () => {
  const navigate = useNavigate();
  const [vistorias, setVistorias] = useState<VistoriaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Accordion State
  const [expandedCiclos, setExpandedCiclos] = useState<Record<string, boolean>>({
    ciclo3: true,
    ciclo2: false,
    legado: false
  });

  // Modal Detalhes
  const [selectedVistoria, setSelectedVistoria] = useState<VistoriaItem | null>(null);

  useEffect(() => {
    fetchVistorias();
  }, []);

  const fetchVistorias = async () => {
    try {
      const res = await api.get('/vistorias');
      setVistorias(res.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCiclo = (cicloKey: string) => {
    setExpandedCiclos(prev => ({ ...prev, [cicloKey]: !prev[cicloKey] }));
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/reports/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historico-inspecoes-brigada-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erro ao exportar planilha Excel.');
    }
  };

  const filteredVistorias = vistorias.filter(v => {
    const matchBusca = 
      v.equipamento_codigo.toLowerCase().includes(busca.toLowerCase()) ||
      v.inspetor_nome.toLowerCase().includes(busca.toLowerCase()) ||
      v.equipamento_setor.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === 'todos' || v.equipamento_tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || v.status_result === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  });

  const totalConformes = filteredVistorias.filter(v => v.status_result === 'APROVADO').length;
  const totalAlertas = filteredVistorias.filter(v => v.status_result !== 'APROVADO').length;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="HISTÓRICO DE INSPEÇÕES" showBack />

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Top Metric Cards (3 Cards Row) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Ciclo Atual */}
          <div className="bg-white rounded-2xl p-4 border-y-2 border-red-500 shadow-sm text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ciclo Atual
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {filteredVistorias.length}
            </span>
          </div>

          {/* Card 2: Conformes */}
          <div className="bg-white rounded-2xl p-4 border-y-2 border-emerald-500 shadow-sm text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Conformes
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {totalConformes}
            </span>
          </div>

          {/* Card 3: Alertas */}
          <div className="bg-white rounded-2xl p-4 border-y-2 border-amber-500 shadow-sm text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Alertas
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
              {totalAlertas}
            </span>
          </div>
        </div>

        {/* Search & Filters Container */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          {/* Search Pill Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-red-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por ID ou Responsável..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-3 text-xs text-slate-800 font-semibold placeholder-slate-400 outline-none focus:border-[#EE1D23]"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-semibold outline-none focus:border-[#EE1D23]"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="extintor">Extintores</option>
              <option value="hidrante">Hidrantes</option>
              <option value="saida_emergencia">Saídas de Emergência</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-semibold outline-none focus:border-[#EE1D23]"
            >
              <option value="todos">Todos os Status</option>
              <option value="APROVADO">Conforme (OK)</option>
              <option value="REPROVADO">Reprovado</option>
            </select>
          </div>

          {/* Export Excel Red Pill Button */}
          <button
            onClick={handleExportExcel}
            className="w-full py-3.5 px-6 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-extrabold text-xs shadow-md shadow-red-500/25 flex items-center justify-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Histórico para Excel</span>
          </button>
        </div>

        {/* Grouped Inspection Cycles (Accordions) */}
        <div className="space-y-4">
          {/* Ciclo #3: EM ANDAMENTO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden border-l-4 border-l-emerald-500">
            {/* Cycle Header Bar */}
            <div
              onClick={() => toggleCiclo('ciclo3')}
              className="p-4 bg-white flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Ciclo #3</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                  EM ANDAMENTO
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Iniciado em 21/09/2026
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">{filteredVistorias.length} inspeções</span>
                {expandedCiclos.ciclo3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Collapsible Inspection Table */}
            {expandedCiclos.ciclo3 && (
              <div className="border-t border-slate-100 overflow-x-auto">
                {loading ? (
                  <div className="p-6 text-center text-xs text-slate-400">Carregando vistorias do ciclo...</div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-3">DATA</th>
                        <th className="p-3">EQUIPAMENTO</th>
                        <th className="p-3">LOCALIZAÇÃO</th>
                        <th className="p-3">RESPONSÁVEL</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-center">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredVistorias.length > 0 ? (
                        filteredVistorias.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-semibold text-slate-600">
                              {new Date(item.data_vistoria).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3">
                              <span className="font-extrabold text-[#EE1D23]">{item.equipamento_codigo}</span>
                              <span className="block text-[11px] text-slate-400">{item.equipamento_subtipo || item.equipamento_tipo}</span>
                            </td>
                            <td className="p-3 max-w-[200px] uppercase text-[11px] leading-tight">
                              {item.equipamento_setor}
                            </td>
                            <td className="p-3 font-semibold">{item.inspetor_nome}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                                OK
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setSelectedVistoria(item)}
                                className="text-red-500 hover:text-red-700 p-1 transition"
                                title="Ver Detalhes da Inspeção"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            Nenhuma vistoria encontrada neste filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Ciclo #2: ENCERRADO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden border-l-4 border-l-red-500">
            <div
              onClick={() => toggleCiclo('ciclo2')}
              className="p-4 bg-white flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Ciclo #2</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                  ENCERRADO
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  20/05/2026 → 21/09/2026 · Encerrado por Bruno Souza
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">10 inspeções</span>
                {expandedCiclos.ciclo2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </div>

          {/* Ciclo Anterior: LEGADO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden border-l-4 border-l-slate-400">
            <div
              onClick={() => toggleCiclo('legado')}
              className="p-4 bg-white flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Ciclo Anterior (Legado)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                  LEGADO
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">3 inspeções</span>
                {expandedCiclos.legado ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes da Vistoria */}
        {selectedVistoria && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800 space-y-4">
              <button
                onClick={() => setSelectedVistoria(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-[#EE1D23]">Detalhes da Vistoria</h3>
              <p className="text-xs font-bold text-slate-900">
                {selectedVistoria.equipamento_codigo} - {selectedVistoria.equipamento_subtipo || selectedVistoria.equipamento_tipo}
              </p>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-bold">Inspetor:</span>
                  <span className="font-extrabold">{selectedVistoria.inspetor_nome}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-bold">Data/Hora:</span>
                  <span className="font-extrabold">{new Date(selectedVistoria.data_vistoria).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-bold">Setor:</span>
                  <span className="font-extrabold text-right max-w-[180px]">{selectedVistoria.equipamento_setor}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-bold">Resultado:</span>
                  <span className="font-black text-emerald-600">{selectedVistoria.status_result}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Observações:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedVistoria.observacoes || 'Sem observações adicionais.'}
                </p>
              </div>

              <button
                onClick={() => setSelectedVistoria(null)}
                className="w-full py-2.5 rounded-full bg-[#EE1D23] text-white font-bold text-xs shadow-md"
              >
                Fechar
              </button>
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
