import React from 'react';
import { LogOut, User } from 'lucide-react';
import { UserSession } from '../types';

interface UserBarProps {
  user: UserSession;
  onLogout: () => void;
}

export const UserBar: React.FC<UserBarProps> = ({ user, onLogout }) => {
  return (
    <div className="no-print w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex flex-row items-center justify-between gap-3">
        {/* Info User */}
        <div className="flex items-center gap-3">
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

        {/* Tombol Keluar Saja */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95 cursor-pointer"
            title="Keluar dari sesi"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
