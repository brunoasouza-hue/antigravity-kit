import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  X, 
  Check, 
  Camera, 
  Save, 
  Image as ImageIcon 
} from 'lucide-react';
import api from '../services/api';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

export const FichaTecnica: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [equip, setEquip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  // States do Checklist Dinâmico (true = Aprovado/Check, false = Reprovado/X)
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true
  });

  const [photoSelected, setPhotoSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (codigo) fetchEquipamento(codigo);
  }, [codigo]);

  const fetchEquipamento = async (code: string) => {
    try {
      const res = await api.get(`/equipamentos/codigo/${code.trim()}`);
      setEquip(res.data);
    } catch (err) {
      console.error('Erro ao buscar ficha técnica:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = (index: number, val: boolean) => {
    setChecklistState(prev => ({ ...prev, [index]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoSelected(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalizarRelatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equip) return;

    setSubmitting(true);
    try {
      // Verificar se todos os itens estão ok
      const allPassed = Object.values(checklistState).every(val => val === true);

      await api.post('/vistorias', {
        equipamento_id: equip.id,
        pressao_ok: checklistState[1] ?? true,
        lacre_ok: checklistState[2] ?? true,
        sinalizacao_ok: checklistState[5] ?? true,
        desobstruido_ok: true,
        validade_ok: checklistState[6] ?? true,
        observacoes: allPassed ? 'Vistoria realizada sem anormalidades.' : 'Item com pendências de conformidade identificadas.',
        foto_url: photoSelected || ''
      });

      alert('Relatório de vistoria finalizado com sucesso!');
      setIsChecklistOpen(false);
      fetchEquipamento(equip.codigo);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao finalizar relatório.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEquipamento = async () => {
    if (!equip) return;
    if (!window.confirm(`Tem certeza que deseja remover o equipamento ${equip.codigo}?`)) return;

    try {
      await api.delete(`/equipamentos/${equip.id}`);
      navigate('/inventario');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover equipamento.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-xs text-slate-500">
        Carregando Ficha Técnica...
      </div>
    );
  }

  if (!equip) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
        <p className="text-slate-600 font-bold mb-4">Equipamento não encontrado.</p>
        <button onClick={() => navigate('/inventario')} className="px-5 py-2.5 rounded-full bg-[#EE1D23] text-white font-bold text-xs">
          Voltar ao Inventário
        </button>
      </div>
    );
  }

  const isHidrante = equip.tipo === 'hidrante';
  const isSaida = equip.tipo === 'saida_emergencia';

  // Checklist Items das imagens
  const checklistItems = isHidrante
    ? [
        '1. Mangueira conforme',
        '2. Esguicho conforme',
        '3. Chave Storz conforme',
        '4. Sinalização do local',
        '5. Validade do teste hidrostático'
      ]
    : isSaida
    ? [
        '1. Porta corta-fogo desobstruída',
        '2. Barra antipânico funcional',
        '3. Sinalização luminosa de emergência OK'
      ]
    : [
        '1. Lacre intacto',
        '2. Anel de identificação',
        '3. Pino de segurança',
        '4. Etiqueta do INMETRO',
        '5. Sinalização do local',
        '6. Validade da recarga',
        '7. Validade do teste hidrostático'
      ];

  const statusLabel = equip.status_geral === 'APROVADO' ? 'Conforme' : 'Pendente';

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="FICHA TÉCNICA" showBack />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Main Ficha Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 relative">
          {/* Header Row: Shield & Status Pill */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#EE1D23] flex items-center justify-center border border-red-100">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              equip.status_geral === 'APROVADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {statusLabel}
            </span>
          </div>

          {/* Title & Code */}
          <div>
            <h2 className="text-3xl font-black text-[#EE1D23]">{equip.codigo}</h2>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{equip.subtipo || equip.tipo}</p>
          </div>

          {/* Data Table Rows */}
          <div className="space-y-4 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-[#EE1D23] uppercase">Capacidade</span>
              <span className="font-bold text-slate-700">{equip.capacidade || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="font-bold text-[#EE1D23] uppercase">Localização</span>
              <span className="font-bold text-slate-700 text-right max-w-[220px] uppercase">{equip.setor}</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="font-bold text-[#EE1D23] uppercase">Última Inspeção</span>
              <span className="font-bold text-slate-700">{statusLabel}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Button Iniciar Inspeção */}
            <button
              onClick={() => setIsChecklistOpen(true)}
              className="w-full py-3.5 px-6 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-black text-sm shadow-md shadow-red-500/25 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Iniciar Inspeção</span>
            </button>

            {/* Button Remover Equipamento */}
            {isAdmin && (
              <button
                onClick={handleDeleteEquipamento}
                className="w-full py-3.5 px-6 rounded-full bg-[#A70000] hover:bg-[#8B0000] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remover Equipamento</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Modal Checklist de Segurança (Imagens 4 e 5) */}
      {isChecklistOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800 space-y-5 my-8">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#EE1D23]">Checklist de Segurança</h3>
              <button onClick={() => setIsChecklistOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500">Marque a conformidade de cada item:</p>

            {/* Lista de itens do Checklist com botões [ ✓ ] e [ ✕ ] */}
            <div className="space-y-2.5">
              {checklistItems.map((itemText, idx) => {
                const itemNum = idx + 1;
                const isChecked = checklistState[itemNum] ?? true;

                return (
                  <div
                    key={itemNum}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-extrabold text-slate-800">{itemText}</span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Check Button [ ✓ ] */}
                      <button
                        type="button"
                        onClick={() => handleToggleCheck(itemNum, true)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition ${
                          isChecked
                            ? 'bg-white border-slate-300 text-slate-800 shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Cancel Button [ ✕ ] */}
                      <button
                        type="button"
                        onClick={() => handleToggleCheck(itemNum, false)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition ${
                          !isChecked
                            ? 'bg-white border-slate-300 text-red-600 shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evidência Fotográfica Box */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-extrabold text-slate-800">Evidência Fotográfica</span>
                <span className="px-2 py-0.5 rounded bg-[#A70000] text-white text-[9px] font-black uppercase">
                  OBRIGATÓRIO
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">Tire uma foto ou selecione do dispositivo</p>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-full bg-[#1E73BE] hover:bg-[#155D9B] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>{photoSelected ? 'Foto Carregada ✓' : 'Selecionar / Tirar Foto'}</span>
              </button>

              {photoSelected && (
                <img src={photoSelected} alt="Evidência" className="w-20 h-20 object-cover rounded-xl mx-auto border" />
              )}
            </div>

            {/* Finalizar Relatório Button */}
            <button
              onClick={handleFinalizarRelatorio}
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-extrabold text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Finalizar Relatório</span>
            </button>
          </div>
        </div>
      )}

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 SENAI - Gestão de Ativos
      </footer>
    </div>
  );
};
