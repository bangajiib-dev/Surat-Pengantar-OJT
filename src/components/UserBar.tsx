import { Printer, LogOut, User, RefreshCw } from 'lucide-react';
import { UserSession } from '../types';

interface UserBarProps {
  user: UserSession;
  onLogout: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const UserBar: React.FC<UserBarProps> = ({ user, onLogout, onSync, isSyncing = false }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Info User */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Peserta OJT
              </span>
              <span className="text-xs text-slate-500 font-mono">
                NIP: {user.nip}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {user.nama}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Tombol Singkronkan Data 1-Klik */}
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95 cursor-pointer disabled:opacity-50"
              title="Singkronkan data terbaru dari spreadsheet secara langsung dengan 1 kali klik"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyingkronkan...' : 'Singkronkan Data'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 cursor-pointer"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95 cursor-pointer"
            title="Keluar dari sesi"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
