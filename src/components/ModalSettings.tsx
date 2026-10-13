import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Link as LinkIcon, Database, RotateCcw } from 'lucide-react';
import { getAppsScriptUrl, setCustomAppsScriptUrl, api } from '../services/api';

interface ModalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (url: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const ModalSettings: React.FC<ModalSettingsProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
  showToast,
}) => {
  const currentUrl = getAppsScriptUrl();
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simpan sementara untuk pengujian
    setCustomAppsScriptUrl(urlInput.trim());

    try {
      const res = await api.ping();
      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Koneksi ke Google Apps Script berhasil terhubung!'
        });
        showToast('success', 'Koneksi Sukses', 'Google Apps Script berhasil dihubungi.');
      } else {
        setTestResult({
          success: false,
          message: res.message || 'Gagal merespon. Pastikan deployment berjenis Web App dengan akses Anyone.'
        });
        showToast('error', 'Koneksi Gagal', res.message || 'Periksa kembali URL Web App.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi server Apps Script.'
      });
      showToast('error', 'Koneksi Gagal', err.message || 'Gagal terhubung.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setCustomAppsScriptUrl(urlInput.trim());
    onUrlUpdated(urlInput.trim());
    showToast('success', 'Pengaturan Disimpan', 'Konfigurasi URL Web App diperbarui.');
    onClose();
  };

  const handleClearUrl = () => {
    setUrlInput('');
    setCustomAppsScriptUrl('');
    onUrlUpdated('');
    setTestResult(null);
    showToast('info', 'URL Dikosongkan', 'Konfigurasi URL Google Apps Script telah dihapus.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Pengaturan Koneksi Google Apps Script
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Aplikasi ini terhubung langsung ke Google Spreadsheet via Google Apps Script Web App. Masukkan URL Web App (berakhiran <code>/exec</code>) di bawah ini:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              URL Web App (VITE_APPS_SCRIPT_URL)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] font-mono"
            />
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !urlInput.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Tes Koneksi</span>
            </button>

            <button
              type="button"
              onClick={handleClearUrl}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan URL</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
