import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Key } from 'lucide-react';
import { Peserta } from '../types';

interface ModalPesertaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (peserta: Peserta, isEdit: boolean, oldNip?: string) => Promise<boolean>;
  initialData?: Peserta | null;
}

export const ModalPeserta: React.FC<ModalPesertaProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEdit = !!initialData;

  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [kodeToko, setKodeToko] = useState('');
  const [namaToko, setNamaToko] = useState('');
  const [tanggalOjt, setTanggalOjt] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setNip(initialData.nip || '');
      setNama(initialData.nama || '');
      setKodeToko(initialData.kodeToko || '');
      setNamaToko(initialData.namaToko || '');
      setTanggalOjt(initialData.tanggalOjt || '');
      setPassword(initialData.password || '123456');
    } else {
      setNip('');
      setNama('');
      setKodeToko('');
      setNamaToko('');
      setTanggalOjt('');
      setPassword('123456');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Generator password acak 6 digit
  const handleGeneratePassword = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNip = nip.trim();
    const cleanNama = nama.trim().toUpperCase();

    if (!cleanNip) {
      setErrorMsg('NIP wajib diisi.');
      return;
    }
    if (!cleanNama) {
      setErrorMsg('Nama Peserta wajib diisi.');
      return;
    }

    // Cegah Formula Injection
    const sanitize = (text: string) => {
      const trimmed = text.trim();
      if (['=', '+', '-', '@'].includes(trimmed.charAt(0))) {
        return "'" + trimmed;
      }
      return trimmed;
    };

    const newPeserta: Peserta = {
      nip: sanitize(cleanNip),
      nama: sanitize(cleanNama),
      kodeToko: sanitize(kodeToko.trim().toUpperCase() || '-'),
      namaToko: sanitize(namaToko.trim().toUpperCase() || '-'),
      tanggalOjt: sanitize(tanggalOjt.trim() || '-'),
      password: sanitize(password.trim() || '123456'),
    };

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ok = await onSave(newPeserta, isEdit, initialData?.nip);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEdit ? 'Edit Data Peserta OJT' : 'Tambah Peserta OJT Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Data akan tersimpan ke Sheet DATA_PESERTA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NIP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                NIP Peserta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Misal: 20260109"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] font-mono"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  Acak
                </button>
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] font-mono"
              />
            </div>
          </div>

          {/* NAMA LENGKAP */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap Peserta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Misal: MUHAMMAD RIZKY SAPUTRA"
              required
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KODE TOKO */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kode Toko
              </label>
              <input
                type="text"
                value={kodeToko}
                onChange={(e) => setKodeToko(e.target.value)}
                placeholder="Misal: T-SBY-042"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] uppercase font-mono"
              />
            </div>

            {/* NAMA TOKO */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Toko Penempatan
              </label>
              <input
                type="text"
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                placeholder="Misal: INDOMARET RAYA PILANG"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] uppercase"
              />
            </div>
          </div>

          {/* TANGGAL OJT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal OJT
            </label>
            <input
              type="text"
              value={tanggalOjt}
              onChange={(e) => setTanggalOjt(e.target.value)}
              placeholder="Misal: Senin, 19 Januari 2026 atau 2026-01-19"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Bisa ditulis teks lengkap atau tanggal standar.
            </p>
          </div>

          {/* Jabatan Info (Fixed) */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <span className="font-medium">Jabatan Default Surat:</span>
            <span className="font-bold font-mono">STORE CREW</span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Peserta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
