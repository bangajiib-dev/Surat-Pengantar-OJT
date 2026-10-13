import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { AuthSession } from '../types';

interface HeaderProps {
  session: AuthSession;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onLogout }) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      {/* 3-Color Indomaret Brand Top Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#005EAA]" title="Biru Indomaret" />
        <div className="h-full w-1/3 bg-[#ED1B24]" title="Merah Indomaret" />
        <div className="h-full w-1/3 bg-[#FFC800]" title="Kuning Indomaret" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3.5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Indomaret.svg"
            alt="Logo Indomaret"
            className="h-8 sm:h-9 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="border-l border-slate-300 pl-3">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Surat Pengantar OJT Tc Surabaya
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              PT. Indomarco Prismatama · Cabang Surabaya
            </p>
          </div>
        </div>

        {/* Jika Admin Login, tampilkan badge admin & tombol keluar */}
        {session?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin ({session.username})</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Keluar Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
