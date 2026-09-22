import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Header } from '../components/Header';
import api from '../services/api';

export const NovaVistoria: React.FC = () => {
  const navigate = useNavigate();
  const [codigoInput, setCodigoInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Inicializar o leitor de QR Code na câmera automaticamente no carregamento da tela
    let scanner: Html5QrcodeScanner | null = null;

    try {
      scanner = new Html5QrcodeScanner(
        'qr-reader-viewport',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          if (decodedText) {
            handleCodeScanned(decodedText);
          }
        },
        (error) => {
          // Ignorar frames normais sem QR Code
        }
      );

      scannerRef.current = scanner;
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Cleanup
        }
      }
    };
  }, []);

  const handleCodeScanned = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {}
    }

    setLoading(true);
    setSearchError('');

    try {
      const res = await api.get(`/equipamentos/codigo/${cleanCode}`);
      if (res.data && res.data.codigo) {
        // Redirecionar para a Ficha Técnica do equipamento escaneado
        navigate(`/ficha/${res.data.codigo}`);
      }
    } catch (err: any) {
      setSearchError(`Equipamento "${cleanCode}" não foi localizado. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;
    handleCodeScanned(codigoInput);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      <Header title="ESCANEAR QR CODE" showBack />

      <main className="flex-1 max-w-md mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Main Card Container Matching Screenshot Pixel-Perfectly */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
          {/* Black Camera Viewport Container */}
          <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center border border-slate-200">
            <div id="qr-reader-viewport" className="w-full h-full" />
          </div>

          {/* Instruction Text */}
          <p className="text-xs font-semibold text-slate-500 text-center leading-relaxed">
            Aponte a câmera para o QR Code fixado no extintor.
          </p>

          {searchError && (
            <p className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
              {searchError}
            </p>
          )}

          {/* Divider */}
          <hr className="border-t border-slate-100 my-2" />

          {/* Manual Entry Section */}
          <form onSubmit={handleManualSearch} className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-800 text-center uppercase tracking-wider">
              Ou digite o número do equipamento:
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                placeholder="Ex: EXT-001"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 font-semibold outline-none focus:border-[#EE1D23]"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-[#EE1D23] hover:bg-[#D0171D] text-white font-extrabold text-xs shadow-md shadow-red-500/20 shrink-0 transition disabled:opacity-50"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3.5 px-6 rounded-full bg-[#A70000] hover:bg-[#8B0000] text-white font-extrabold text-xs shadow-md transition text-center mt-2"
            >
              Cancelar
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 SENAI - Gestão de Ativos
      </footer>
    </div>
  );
};
