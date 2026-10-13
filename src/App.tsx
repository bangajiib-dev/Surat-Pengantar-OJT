/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthSession, UserSession, Peserta, ToastMessage } from './types';
import { getSavedSession, saveSession, clearSession, getAppsScriptUrl, api } from './services/api';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { UserBar } from './components/UserBar';
import { SuratOJT } from './components/SuratOJT';
import { AdminDashboard } from './components/AdminDashboard';
import { ModalPeserta } from './components/ModalPeserta';
import { ModalImport } from './components/ModalImport';
import { ModalSuratPreview } from './components/ModalSuratPreview';
import { ModalSettings } from './components/ModalSettings';
import { ModalPanduan } from './components/ModalPanduan';
import { ToastContainer, ConfirmModal } from './components/Toast';

export default function App() {
  const [session, setSession] = useState<AuthSession>(null);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(getAppsScriptUrl());

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Admin Modals State
  const [isModalPesertaOpen, setIsModalPesertaOpen] = useState(false);
  const [editingPeserta, setEditingPeserta] = useState<Peserta | null>(null);

  const [isModalImportOpen, setIsModalImportOpen] = useState(false);
  const [isModalSettingsOpen, setIsModalSettingsOpen] = useState(false);
  const [isModalPanduanOpen, setIsModalPanduanOpen] = useState(false);

  const [previewPeserta, setPreviewPeserta] = useState<Peserta | null>(null);
  const [isModalPreviewOpen, setIsModalPreviewOpen] = useState(false);

  // Muat sesi dari localStorage saat mount
  useEffect(() => {
    const saved = getSavedSession();
    if (saved) {
      setSession(saved);
    }
  }, []);

  // Helper Toast
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper Modal Konfirmasi
  const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Handler Login & Logout
  const handleLoginSuccess = (newSession: AuthSession) => {
    if (newSession) {
      saveSession(newSession);
      setSession(newSession);
    }
  };

  const handleLogout = () => {
    openConfirmModal('Konfirmasi Keluar', 'Apakah Anda ingin keluar dari akun saat ini?', () => {
      clearSession();
      setSession(null);
      showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari aplikasi.');
    });
  };

  // Handler Tambah/Edit Peserta (Admin)
  const handleSavePeserta = async (
    peserta: Peserta,
    isEdit: boolean,
    oldNip?: string
  ): Promise<boolean> => {
    if (!session || session.role !== 'admin') return false;

    try {
      if (isEdit && oldNip) {
        const res = await api.updatePeserta(session.token, oldNip, peserta);
        if (res.success) {
          showToast('success', 'Berhasil Diperbarui', res.message || 'Data peserta diperbarui.');
          return true;
        } else {
          showToast('error', 'Gagal Memperbarui', res.message || 'Terjadi kesalahan.');
          return false;
        }
      } else {
        const res = await api.addPeserta(session.token, peserta);
        if (res.success) {
          showToast('success', 'Berhasil Ditambahkan', res.message || 'Peserta baru ditambahkan.');
          return true;
        } else {
          showToast('error', 'Gagal Menambahkan', res.message || 'Terjadi kesalahan.');
          return false;
        }
      }
    } catch (err: any) {
      showToast('error', 'Kesalahan', err.message || 'Gagal menyimpan ke server.');
      return false;
    }
  };

  // Handler Import Massal (Admin)
  const handleBatchImport = async (rows: Peserta[]): Promise<boolean> => {
    if (!session || session.role !== 'admin') return false;

    try {
      const res = await api.batchImportPeserta(session.token, rows);
      if (res.success) {
        showToast(
          'success',
          'Import Berhasil',
          res.message || `${rows.length} data peserta berhasil diproses.`
        );
        return true;
      } else {
        showToast('error', 'Import Gagal', res.message || 'Gagal memproses baris import.');
        return false;
      }
    } catch (err: any) {
      showToast('error', 'Kesalahan', err.message || 'Gagal mengimpor ke server.');
      return false;
    }
  };

  const [isUserSyncing, setIsUserSyncing] = useState(false);

  // SINKRONISASI LIVE BACKGROUND UNTUK PESERTA OJT
  // Memeriksa pembaruan data toko atau tanggal OJT di spreadsheet secara otomatis
  useEffect(() => {
    if (!session || session.role !== 'user') return;
    const interval = setInterval(() => {
      api.getProfile(session.token)
        .then((res) => {
          if (res.success && res.data && res.data.user) {
            const u = res.data.user;
            setSession((prev) => {
              if (!prev || prev.role !== 'user') return prev;
              if (
                prev.nama !== u.nama ||
                prev.kodeToko !== u.kodeToko ||
                prev.namaToko !== u.namaToko ||
                prev.tanggalOjt !== u.tanggalOjt
              ) {
                const updated: UserSession = {
                  ...prev,
                  nama: u.nama,
                  kodeToko: u.kodeToko,
                  namaToko: u.namaToko,
                  tanggalOjt: u.tanggalOjt,
                };
                saveSession(updated);
                return updated;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 12000); // Cek setiap 12 detik di background

    return () => clearInterval(interval);
  }, [session?.role, (session as any)?.token]);

  // Handler Singkronkan Data Peserta Manual 1-Klik
  const handleUserSync = async () => {
    if (!session || session.role !== 'user') return;
    setIsUserSyncing(true);
    try {
      const res = await api.getProfile(session.token);
      if (res.success && res.data && res.data.user) {
        const u = res.data.user;
        const updated: UserSession = {
          ...session,
          nama: u.nama,
          kodeToko: u.kodeToko,
          namaToko: u.namaToko,
          tanggalOjt: u.tanggalOjt,
        };
        setSession(updated);
        saveSession(updated);
        showToast('success', 'Sinkronisasi Berhasil', 'Data surat diperbarui sesuai baris spreadsheet terbaru.');
      } else {
        showToast('info', 'Status Data', 'Data surat Anda sudah sesuai dengan spreadsheet.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Singkron', err.message || 'Tidak dapat terhubung ke server spreadsheet.');
    } finally {
      setIsUserSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header Aplikasi (Tersembunyi saat cetak) */}
      <Header session={session} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1">
        {session?.role === 'user' ? (
          // TAMPILAN USER (PESERTA OJT)
          <div>
            {/* User Bar di bagian atas (NIP, Nama, Tombol Cetak, Singkronkan Data, & Keluar) */}
            <UserBar
              user={session}
              onLogout={handleLogout}
              onSync={handleUserSync}
              isSyncing={isUserSyncing}
            />

            {/* Kontainer Surat Pengantar OJT */}
            <div className="py-6 px-2 sm:px-4 flex justify-center overflow-x-auto print:p-0 print:m-0 print:overflow-visible">
              <div className="w-full max-w-[210mm] print:max-w-none">
                <SuratOJT
                  peserta={{
                    nip: session.nip,
                    nama: session.nama,
                    kodeToko: session.kodeToko,
                    namaToko: session.namaToko,
                    tanggalOjt: session.tanggalOjt,
                  }}
                />
              </div>
            </div>
          </div>
        ) : session?.role === 'admin' ? (
          // TAMPILAN ADMIN (DASHBOARD KELOLA DATA)
          <AdminDashboard
            session={session}
            showToast={showToast}
            openConfirmModal={openConfirmModal}
            onViewSurat={(p) => {
              setPreviewPeserta(p);
              setIsModalPreviewOpen(true);
            }}
            onAddPeserta={() => {
              setEditingPeserta(null);
              setIsModalPesertaOpen(true);
            }}
            onEditPeserta={(p) => {
              setEditingPeserta(p);
              setIsModalPesertaOpen(true);
            }}
            onOpenImport={() => setIsModalImportOpen(true)}
          />
        ) : (
          // TAMPILAN BELUM LOGIN (FORM LOGIN)
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer (Tersembunyi saat cetak) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <p>© {new Date().getFullYear()} PT. Indomarco Prismatama · Cabang Surabaya. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <ModalPeserta
        isOpen={isModalPesertaOpen}
        onClose={() => setIsModalPesertaOpen(false)}
        onSave={handleSavePeserta}
        initialData={editingPeserta}
      />

      <ModalImport
        isOpen={isModalImportOpen}
        onClose={() => setIsModalImportOpen(false)}
        onImport={handleBatchImport}
      />

      <ModalSuratPreview
        isOpen={isModalPreviewOpen}
        onClose={() => {
          setIsModalPreviewOpen(false);
          setPreviewPeserta(null);
        }}
        peserta={previewPeserta}
      />

      <ModalSettings
        isOpen={isModalSettingsOpen}
        onClose={() => setIsModalSettingsOpen(false)}
        onUrlUpdated={(url) => setAppsScriptUrl(url)}
        showToast={showToast}
      />

      <ModalPanduan
        isOpen={isModalPanduanOpen}
        onClose={() => setIsModalPanduanOpen(false)}
        showToast={showToast}
      />

      {/* Modern Toasts Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
