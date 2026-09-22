import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC<{ title: string }> = ({ title }) => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white capitalize">{title}</h2>
        <p className="text-xs text-slate-400 capitalize">{todayFormatted}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Nova Vistoria */}
        <Link
          to="/vistoria"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all duration-200"
        >
          <QrCode className="w-4 h-4" />
          <span>Escanear QR Code</span>
        </Link>

        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sistema Operacional</span>
        </div>
      </div>
    </header>
  );
};
