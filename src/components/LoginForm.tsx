import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, ArrowRight, Settings, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { AuthSession } from '../types';

interface LoginFormProps {
  onLoginSuccess: (session: AuthSession) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  isConnected: boolean;
  onOpenSettings: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  showToast,
  isConnected,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // State User
  const [nip, setNip] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // State Admin
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Handle Login User (Peserta)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNip = nip.trim();
    const cleanPass = userPassword.trim();

    if (!isConnected) {
      showToast('error', 'Database Belum Terhubung', 'Silakan atur URL Google Apps Script terlebih dahulu melalui tombol Pengaturan.');
      onOpenSettings();
      return;
    }

    if (!cleanNip) {
      showToast('error', 'Validasi Gagal', 'Silakan masukkan NIP Anda.');
      return;
    }
    if (!cleanPass) {
      showToast('error', 'Validasi Gagal', 'Silakan masukkan Password Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.loginUser(cleanNip, cleanPass);
      if (res.success && res.user && res.token) {
        showToast('success', 'Login Berhasil', `Selamat datang, ${res.user.nama}`);
        onLoginSuccess({
          role: 'user',
          nip: res.user.nip,
          nama: res.user.nama,
          kodeToko: res.user.kodeToko,
          namaToko: res.user.namaToko,
          tanggalOjt: res.user.tanggalOjt,
          token: res.token,
        });
      } else {
        showToast('error', 'Login Gagal', res.message || 'NIP atau Password salah.');
      }
    } catch (err: any) {
      showToast('error', 'Kesalahan Sistem', err.message || 'Gagal menghubungi server Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Admin
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsername.trim();
    const cleanPass = adminPassword.trim();

    if (!isConnected) {
      showToast('error', 'Database Belum Terhubung', 'Silakan atur URL Google Apps Script terlebih dahulu melalui tombol Pengaturan.');
      onOpenSettings();
      return;
    }

    if (!cleanUser) {
      showToast('error', 'Validasi Gagal', 'Silakan masukkan Username Admin.');
      return;
    }
    if (!cleanPass) {
      showToast('error', 'Validasi Gagal', 'Silakan masukkan Password Admin.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.loginAdmin(cleanUser, cleanPass);
      if (res.success && res.token && res.admin) {
        showToast('success', 'Login Admin Berhasil', `Selamat datang di Dashboard Admin TC Surabaya`);
        onLoginSuccess({
          role: 'admin',
          username: res.admin.username,
          token: res.token,
        });
      } else {
        showToast('error', 'Login Gagal', res.message || 'Username atau Password Admin salah.');
      }
    } catch (err: any) {
      showToast('error', 'Kesalahan Sistem', err.message || 'Gagal menghubungi server Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all">
        {/* Banner Peringatan jika URL belum dipasang */}
        {!isConnected && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Spreadsheet Belum Dihubungkan</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Masukkan URL Web App Google Apps Script Anda agar data tersinkronisasi live.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-[11px] shrink-0 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Atur URL</span>
            </button>
          </div>
        )}

        {/* Card Header dengan Logo Indomaret */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-100">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Indomaret.svg"
              alt="Logo Indomaret"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Surat Pengantar OJT Tc Surabaya
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            PT. Indomarco Prismatama · Training Center Cabang Surabaya
          </p>

          {/* Tab Selector: Peserta vs Admin */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-white text-[#005EAA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Peserta OJT</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-[#005EAA] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin TC</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {activeTab === 'user' ? (
            <form onSubmit={handleUserLogin} className="space-y-4">
              {/* Input NIP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIP Peserta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Masukkan NIP Anda"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] focus:border-transparent transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sesuai data di Google Spreadsheet DATA_PESERTA.
                </p>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#005EAA] hover:bg-[#004b88] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk & Tampilkan Surat</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Input Admin Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Input Admin Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan Password Admin (Tcsby123)"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Password admin: <strong>Tcsby123</strong>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#ED1B24] hover:bg-[#c9141c] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk Dashboard Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
