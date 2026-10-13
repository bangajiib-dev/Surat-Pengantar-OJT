import React from 'react';
import { Settings, HelpCircle, Shield, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthSession } from '../types';

interface HeaderProps {
  session: AuthSession;
  appsScriptUrl: string;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenPanduan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  appsScriptUrl,
  onLogout,
  onOpenSettings,
  onOpenPanduan,
}) => {
  const isConnected = !!appsScriptUrl;

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

        {/* Action Controls & Session */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Koneksi Badge */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Klik untuk konfigurasi URL Google Apps Script"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Spreadsheet Live Terhubung</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Spreadsheet Belum Terhubung</span>
              </>
            )}
          </button>

          {/* Tombol Panduan Setup */}
          <button
            onClick={onOpenPanduan}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Panduan Setup Google Apps Script dari Nol"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Panduan Setup</span>
          </button>

          {/* Tombol Pengaturan URL */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Pengaturan URL Web App"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Jika Admin Login, tampilkan badge admin & logout */}
          {session?.role === 'admin' && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin ({session.username})</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                title="Keluar Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
