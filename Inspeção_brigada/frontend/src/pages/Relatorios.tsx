import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Header } from '../components/Header';

export const Relatorios: React.FC = () => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get('/reports/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-inspecao-brigada-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erro ao baixar relatório PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      const response = await api.get('/reports/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventario-vistorias-brigada-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erro ao baixar planilha Excel.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="RELATÓRIOS E EXPORTAÇÃO" showBack />

      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-4">

        {/* Intro */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#EE1D23] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Exportar Relatórios Oficiais</h2>
              <p className="text-xs text-slate-500 font-medium">Formatos PDF e Excel para auditorias</p>
            </div>
          </div>
        </div>

        {/* Card PDF */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#EE1D23] px-5 py-3.5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <h3 className="text-sm font-black text-white">Relatório Completo em PDF</h3>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Documento formatado para impressão ou apresentação em auditorias e fiscalizações do trabalho.
            </p>

            <ul className="space-y-2">
              {[
                'Lista completa do inventário de extintores e hidrantes',
                'Status de conformidade (Aprovado / Alerta / Reprovado)',
                'Datas de validade da carga e teste hidrostático',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EE1D23] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="w-full py-3 px-4 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition disabled:opacity-50"
            >
              {downloadingPdf ? (
                <span>Gerando PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Relatório PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Excel */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-emerald-600 px-5 py-3.5 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            <h3 className="text-sm font-black text-white">Planilha Completa em Excel (.xlsx)</h3>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Planilha com abas organizadas para análise de dados e filtros de inventário.
            </p>

            <ul className="space-y-2">
              {[
                'Aba 1: Inventário completo de equipamentos',
                'Aba 2: Histórico de todas as vistorias com inspetores',
                'Pronto para gráficos e relatórios dinâmicos',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {downloadingExcel ? (
                <span>Gerando Excel...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
