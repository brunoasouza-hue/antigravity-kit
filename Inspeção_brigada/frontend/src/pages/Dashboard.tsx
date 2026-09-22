import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scan, 
  Camera, 
  Database, 
  List, 
  RotateCcw, 
  UserPlus, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEquipamentos: 0,
    totalAprovados: 0,
    totalAlerta: 0,
    totalReprovados: 0,
    vistoriasMes: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats({
        totalEquipamentos: res.data.totalEquipamentos || 0,
        totalAprovados: res.data.totalAprovados || 0,
        totalAlerta: res.data.totalAlerta || 0,
        totalReprovados: res.data.totalReprovados || 0,
        vistoriasMes: res.data.vistoriasMes || 0
      });
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReiniciarCiclo = async () => {
    if (!window.confirm('Deseja zerar o ciclo atual de inspeções? Esta ação atualizará os status para pendentes de nova vistoria.')) {
      return;
    }
    try {
      alert('Ciclo de inspeções reiniciado com sucesso! Todos os equipamentos aguardam nova verificação.');
      fetchStats();
    } catch (err) {
      alert('Erro ao reiniciar ciclo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="PAINEL PRINCIPAL" />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Card 1: Nova Inspeção */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-[#EE1D23]">
            <Scan className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Nova Inspeção</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed font-medium">
              Escaneie o QR Code do reservatório para iniciar a verificação técnica.
            </p>
          </div>

          <button
            onClick={() => navigate('/vistoria')}
            className="w-full py-3.5 px-6 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-extrabold text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-98"
          >
            <Camera className="w-5 h-5" />
            <span>Abrir Scanner</span>
          </button>
        </div>

        {/* Card 2: Resumo da Unidade */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Resumo da Unidade</h2>
          </div>

          {/* Table / Summary Rows */}
          <div className="space-y-3 divide-y divide-slate-100 text-sm font-semibold">
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#EE1D23] font-bold">Total de Equipamentos</span>
              <span className="text-slate-800 text-base font-extrabold">{stats.totalEquipamentos}</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-[#EE1D23] font-bold">Inspecionados</span>
              <span className="text-emerald-600 text-base font-black">{stats.totalAprovados}</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-[#EE1D23] font-bold">Alertas de Manutenção</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {stats.totalAlerta} Alertas
              </span>
            </div>
          </div>

          {/* Action Buttons Stack */}
          <div className="space-y-3 pt-2">
            {/* Button 1: Ver Inventário Completo */}
            <button
              onClick={() => navigate('/inventario')}
              className="w-full py-3.5 px-6 rounded-full bg-[#EFEFEF] hover:bg-[#E2E2E2] text-[#333333] font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xs"
            >
              <List className="w-4 h-4 text-slate-600" />
              <span>Ver Inventário Completo</span>
            </button>

            {/* Button 2: Histórico de Inspeções (Auditoria) */}
            <button
              onClick={() => navigate('/historico')}
              className="w-full py-3.5 px-6 rounded-full bg-[#1E73BE] hover:bg-[#155D9B] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Histórico de Inspeções (Auditoria)</span>
            </button>

            {/* Button 3: Cadastrar Novo Usuário (Admin) */}
            {isAdmin && (
              <button
                onClick={() => navigate('/usuarios')}
                className="w-full py-3.5 px-6 rounded-full bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Novo Usuário</span>
              </button>
            )}

            {/* Button 4: Reiniciar Ciclo de Inspeções */}
            <button
              onClick={handleReiniciarCiclo}
              className="w-full py-3.5 px-6 rounded-full border-2 border-[#EE1D23] hover:bg-red-50 text-[#EE1D23] font-extrabold text-sm flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Ciclo de Inspeções</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 SENAI - Gestão de Ativos
      </footer>
    </div>
  );
};
