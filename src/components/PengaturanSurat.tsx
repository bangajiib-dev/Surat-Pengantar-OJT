import React, { useState, useRef } from 'react';
import { Upload, Trash2, CheckCircle2, Image as ImageIcon, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { AsetSurat } from '../types';
import { api, saveCachedAsetSurat } from '../services/api';

interface PengaturanSuratProps {
  token: string;
  asetSurat: AsetSurat;
  onAsetUpdated: (aset: AsetSurat) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export const PengaturanSurat: React.FC<PengaturanSuratProps> = ({
  token,
  asetSurat,
  onAsetUpdated,
  showToast,
  openConfirmModal,
}) => {
  // State draft preview sebelum disimpan
  const [ttdDraft, setTtdDraft] = useState<string | null>(null);
  const [stempelDraft, setStempelDraft] = useState<string | null>(null);

  // Loading states
  const [isSavingTtd, setIsSavingTtd] = useState(false);
  const [isSavingStempel, setIsSavingStempel] = useState(false);
  const [isDeletingTtd, setIsDeletingTtd] = useState(false);
  const [isDeletingStempel, setIsDeletingStempel] = useState(false);

  const ttdInputRef = useRef<HTMLInputElement>(null);
  const stempelInputRef = useRef<HTMLInputElement>(null);

  /**
   * Mengecilkan gambar di sisi browser menggunakan HTML5 Canvas
   * (Maksimal lebar 600px, tetap mempertahankan transparansi format PNG)
   */
  const resizeImageInBrowser = (file: File): Promise<{ dataUrl: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Gagal memproses gambar.'));
            return;
          }

          // Bersihkan canvas agar background transparan tetap terjaga
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Pertahankan PNG jika aslinya PNG
          const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
          const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
          const quality = isJpeg ? 0.9 : undefined;
          const resizedDataUrl = canvas.toDataURL(mimeType, quality);

          resolve({ dataUrl: resizedDataUrl, mimeType });
        };
        img.onerror = () => reject(new Error('Gagal membaca gambar.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsDataURL(file);
    });
  };

  // Handler pilih file Tanda Tangan
  const handleSelectTtd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showToast('error', 'Format Tidak Didukung', 'Hanya menerima format PNG, JPG, atau JPEG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran Terlalu Besar', 'Ukuran file maksimal 2 MB.');
      return;
    }

    try {
      const { dataUrl } = await resizeImageInBrowser(file);
      setTtdDraft(dataUrl);
      showToast('info', 'Gambar Dipilih', 'Pratinjau tanda tangan siap disimpan.');
    } catch {
      showToast('error', 'Gagal', 'Gagal memproses gambar tanda tangan.');
    }
  };

  // Handler pilih file Stempel
  const handleSelectStempel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showToast('error', 'Format Tidak Didukung', 'Hanya menerima format PNG, JPG, atau JPEG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran Terlalu Besar', 'Ukuran file maksimal 2 MB.');
      return;
    }

    try {
      const { dataUrl } = await resizeImageInBrowser(file);
      setStempelDraft(dataUrl);
      showToast('info', 'Gambar Dipilih', 'Pratinjau stempel siap disimpan.');
    } catch {
      showToast('error', 'Gagal', 'Gagal memproses gambar stempel.');
    }
  };

  // Simpan Tanda Tangan ke server
  const handleSaveTtd = async () => {
    if (!ttdDraft) return;
    setIsSavingTtd(true);

    try {
      const res = await api.simpanAsetSurat(token, 'ttd', ttdDraft, 'image/png');
      if (res.success) {
        const updated = { ...asetSurat, ttd: ttdDraft };
        saveCachedAsetSurat(updated);
        onAsetUpdated(updated);
        setTtdDraft(null);
        showToast('success', 'Berhasil Disimpan', 'Tanda tangan berhasil diupload dan aktif untuk semua surat.');
      } else {
        // Jika server offline / izin Drive belum disetujui, simpan lokal sebagai fallback
        const updated = { ...asetSurat, ttd: ttdDraft };
        saveCachedAsetSurat(updated);
        onAsetUpdated(updated);
        setTtdDraft(null);
        showToast('success', 'Tersimpan (Lokal)', res.message || 'Tanda tangan disimpan dan aktif di surat.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err.message || 'Gagal menyimpan tanda tangan.');
    } finally {
      setIsSavingTtd(false);
    }
  };

  // Simpan Stempel ke server
  const handleSaveStempel = async () => {
    if (!stempelDraft) return;
    setIsSavingStempel(true);

    try {
      const res = await api.simpanAsetSurat(token, 'stempel', stempelDraft, 'image/png');
      if (res.success) {
        const updated = { ...asetSurat, stempel: stempelDraft };
        saveCachedAsetSurat(updated);
        onAsetUpdated(updated);
        setStempelDraft(null);
        showToast('success', 'Berhasil Disimpan', 'Stempel berhasil diupload dan aktif untuk semua surat.');
      } else {
        const updated = { ...asetSurat, stempel: stempelDraft };
        saveCachedAsetSurat(updated);
        onAsetUpdated(updated);
        setStempelDraft(null);
        showToast('success', 'Tersimpan (Lokal)', res.message || 'Stempel disimpan dan aktif di surat.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err.message || 'Gagal menyimpan stempel.');
    } finally {
      setIsSavingStempel(false);
    }
  };

  // Hapus Tanda Tangan
  const handleDeleteTtd = () => {
    openConfirmModal(
      'Hapus Tanda Tangan',
      'Apakah Anda yakin ingin menghapus tanda tangan? Area tanda tangan di surat akan menjadi kosong.',
      async () => {
        setIsDeletingTtd(true);
        try {
          await api.hapusAsetSurat(token, 'ttd');
          const updated = { ...asetSurat, ttd: null };
          saveCachedAsetSurat(updated);
          onAsetUpdated(updated);
          setTtdDraft(null);
          showToast('success', 'Berhasil Dihapus', 'Tanda tangan telah dihapus.');
        } catch {
          showToast('error', 'Gagal', 'Tidak dapat menghapus tanda tangan.');
        } finally {
          setIsDeletingTtd(false);
        }
      }
    );
  };

  // Hapus Stempel
  const handleDeleteStempel = () => {
    openConfirmModal(
      'Hapus Stempel',
      'Apakah Anda yakin ingin menghapus stempel dari surat?',
      async () => {
        setIsDeletingStempel(true);
        try {
          await api.hapusAsetSurat(token, 'stempel');
          const updated = { ...asetSurat, stempel: null };
          saveCachedAsetSurat(updated);
          onAsetUpdated(updated);
          setStempelDraft(null);
          showToast('success', 'Berhasil Dihapus', 'Stempel telah dihapus.');
        } catch {
          showToast('error', 'Gagal', 'Tidak dapat menghapus stempel.');
        } finally {
          setIsDeletingStempel(false);
        }
      }
    );
  };

  const activeTtd = ttdDraft || asetSurat.ttd;
  const activeStempel = stempelDraft || asetSurat.stempel;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          Pengaturan Aset Surat (Tanda Tangan & Stempel)
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Upload file tanda tangan dan cap stempel resmi Training Center Surabaya. File yang disimpan otomatis muncul pada bagian bawah surat pengantar untuk <strong>SEMUA user</strong> dan akan ikut tercetak saat cetak/simpan PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KARTU 1: TANDA TANGAN (UTAMA) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>Tanda Tangan Trainer</span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Wajib
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atas nama: <strong>Abdul Rokhman K</strong>
                </p>
              </div>

              {asetSurat.ttd && !ttdDraft && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Aktif
                </span>
              )}
            </div>

            {/* Area Preview Gambar */}
            <div className="w-full h-36 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-3 relative overflow-hidden group">
              {activeTtd ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activeTtd}
                    alt="Pratinjau Tanda Tangan"
                    className="max-h-28 max-w-full object-contain drop-shadow-xs"
                  />
                  {ttdDraft && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Draft (Belum Disimpan)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Belum ada tanda tangan</p>
                  <p className="text-[11px] text-slate-400">Klik 'Pilih Gambar' untuk mengupload</p>
                </div>
              )}
            </div>

            {/* Petunjuk format */}
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p>• Format: <strong>PNG, JPG, JPEG</strong> (Maks. 2 MB)</p>
              <p className="text-blue-700 font-medium">
                • Disarankan PNG dengan latar transparan agar tidak menutupi tulisan surat.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={ttdInputRef}
              onChange={handleSelectTtd}
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => ttdInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeTtd ? 'Ganti Gambar' : 'Pilih Gambar'}</span>
            </button>

            {ttdDraft && (
              <button
                type="button"
                onClick={handleSaveTtd}
                disabled={isSavingTtd}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingTtd ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan TTD</span>
              </button>
            )}

            {asetSurat.ttd && (
              <button
                type="button"
                onClick={handleDeleteTtd}
                disabled={isDeletingTtd}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* KARTU 2: STEMPEL RESMI (OPSIONAL) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>Cap / Stempel Resmi</span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Opsional
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stempel: <strong>PT. INDOMARCO PRISMATAMA - SURABAYA</strong>
                </p>
              </div>

              {asetSurat.stempel && !stempelDraft && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Aktif
                </span>
              )}
            </div>

            {/* Area Preview Gambar */}
            <div className="w-full h-36 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-3 relative overflow-hidden group">
              {activeStempel ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activeStempel}
                    alt="Pratinjau Stempel"
                    className="max-h-28 max-w-full object-contain drop-shadow-xs opacity-90"
                  />
                  {stempelDraft && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Draft (Belum Disimpan)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Belum ada stempel khusus</p>
                  <p className="text-[11px] text-slate-400">Klik 'Pilih Gambar' untuk mengupload stempel scan</p>
                </div>
              )}
            </div>

            {/* Petunjuk format */}
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p>• Format: <strong>PNG, JPG, JPEG</strong> (Maks. 2 MB)</p>
              <p className="text-blue-700 font-medium">
                • Disarankan PNG transparan agar stempel menimpa tanda tangan secara natural.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={stempelInputRef}
              onChange={handleSelectStempel}
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => stempelInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeStempel ? 'Ganti Gambar' : 'Pilih Gambar'}</span>
            </button>

            {stempelDraft && (
              <button
                type="button"
                onClick={handleSaveStempel}
                disabled={isSavingStempel}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingStempel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan Stempel</span>
              </button>
            )}

            {asetSurat.stempel && (
              <button
                type="button"
                onClick={handleDeleteStempel}
                disabled={isDeletingStempel}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
