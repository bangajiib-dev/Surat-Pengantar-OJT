import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  RefreshCw,
  FileText,
  Edit2,
  Trash2,
  Store,
  Calendar,
  KeyRound,
  Download,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Peserta, AdminSession } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  session: AdminSession;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  onViewSurat: (peserta: Peserta) => void;
  onAddPeserta: () => void;
  onEditPeserta: (peserta: Peserta) => void;
  onOpenImport: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  showToast,
  openConfirmModal,
  onViewSurat,
  onAddPeserta,
  onEditPeserta,
  onOpenImport,
}) => {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Memuat...');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokoFilter, setSelectedTokoFilter] = useState('ALL');

  // Muat data dari server (bisa dipanggil silent di background atau manual)
  const syncData = async (isManualClick = false) => {
    if (isManualClick) {
      setIsSyncing(true);
    }
    try {
      const res = await api.getAllPeserta(session.token);
      if (res.success && res.data) {
        setPesertaList(res.data);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);

        if (isManualClick) {
          showToast('success', 'Sinkronisasi Berhasil', `Data diperbarui dari Google Spreadsheet (${res.data.length} peserta).`);
        }
      } else if (isManualClick) {
        showToast('error', 'Gagal Sinkronisasi', res.message || 'Tidak dapat mengambil data dari spreadsheet.');
      }
    } catch (err: any) {
      if (isManualClick) {
        showToast('error', 'Kesalahan Jaringan', err.message || 'Gagal terhubung ke database.');
      }
    } finally {
      setIsLoading(false);
      if (isManualClick) {
        setIsSyncing(false);
      }
    }
  };

  // Sinkronisasi pertama kali saat halaman dimuat
  useEffect(() => {
    syncData(false);
  }, []);

  // SINKRONISASI OTOMATIS DI BELAKANG LAYAR (LIVE BACKGROUND SYNC)
  // Berjalan otomatis setiap 10 detik tanpa mengganggu tampilan pengguna
  useEffect(() => {
    const interval = setInterval(() => {
      // Ambil data terbaru secara silent
      api.getAllPeserta(session.token)
        .then((res) => {
          if (res.success && res.data) {
            setPesertaList(res.data);
            const now = new Date();
            setLastSyncTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        })
        .catch(() => {
          // Silent catch agar tidak mengganggu fokus pengguna saat polling periodik
        });
    }, 10000); // Polling setiap 10 detik

    return () => clearInterval(interval);
  }, [session.token]);

  // Filter daftar toko unik untuk opsi filter
  const uniqueTokoList = useMemo(() => {
    const tokoSet = new Set<string>();
    pesertaList.forEach((p) => {
      if (p.namaToko && p.namaToko !== '-') {
        tokoSet.add(p.namaToko);
      }
    });
    return Array.from(tokoSet).sort();
  }, [pesertaList]);

  // Filter dan pencarian data peserta
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pesertaList.filter((p) => {
      const matchSearch =
        !q ||
        p.nip.toLowerCase().includes(q) ||
        p.nama.toLowerCase().includes(q) ||
        p.kodeToko.toLowerCase().includes(q) ||
        p.namaToko.toLowerCase().includes(q) ||
        p.tanggalOjt.toLowerCase().includes(q);

      const matchToko =
        selectedTokoFilter === 'ALL' || p.namaToko === selectedTokoFilter;

      return matchSearch && matchToko;
    });
  }, [pesertaList, searchQuery, selectedTokoFilter]);

  // Handler Hapus Peserta dengan Modal Konfirmasi
  const handleDelete = (p: Peserta) => {
    openConfirmModal(
      'Hapus Data Peserta',
      `Apakah Anda yakin ingin menghapus peserta ${p.nama} (NIP: ${p.nip}) dari database? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          const res = await api.deletePeserta(session.token, p.nip);
          if (res.success) {
            showToast('success', 'Berhasil Dihapus', `Data peserta ${p.nama} telah dihapus.`);
            // Update state lokal
            setPesertaList((prev) => prev.filter((item) => item.nip !== p.nip));
          } else {
            showToast('error', 'Gagal Menghapus', res.message || 'Terjadi kesalahan.');
          }
        } catch (err: any) {
          showToast('error', 'Kesalahan', err.message || 'Gagal menghapus data peserta.');
        }
      }
    );
  };

  // Export CSV sederhana langsung di browser
  const handleExportCSV = () => {
    if (pesertaList.length === 0) {
      showToast('info', 'Data Kosong', 'Tidak ada data peserta untuk diekspor.');
      return;
    }

    const header = ['NIP', 'NAMA', 'KODE TOKO', 'NAMA TOKO', 'TANGGAL OJT', 'PASSWORD'];
    const rows = pesertaList.map((p) => [
      `"${p.nip}"`,
      `"${p.nama}"`,
      `"${p.kodeToko}"`,
      `"${p.namaToko}"`,
      `"${p.tanggalOjt}"`,
      `"${p.password || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_PESERTA_OJT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Ekspor Berhasil', 'File CSV berhasil diunduh.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1: Total Peserta */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005EAA] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Peserta OJT
            </p>
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
              {pesertaList.length}
            </h3>
          </div>
        </div>

        {/* Stat 2: Toko Unik */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Toko Penempatan
            </p>
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
              {uniqueTokoList.length}
            </h3>
          </div>
        </div>

        {/* Stat 3: Jabatan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jabatan OJT
            </p>
            <h3 className="text-base font-bold text-slate-900 truncate">
              STORE CREW
            </h3>
          </div>
        </div>

        {/* Stat 4: Sistem Database */}
        <div className="bg-gradient-to-br from-blue-900 to-[#005EAA] p-5 rounded-xl text-white shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-blue-200">
              Training Center Surabaya
            </p>
            <h4 className="text-sm font-bold mt-0.5">
              Database DATA_PESERTA
            </h4>
          </div>
          <div className="text-xs text-blue-100 flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Terhubung Live</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NIP, nama peserta, kode/nama toko..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Toko */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTokoFilter}
              onChange={(e) => setSelectedTokoFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] cursor-pointer"
            >
              <option value="ALL">Semua Toko ({uniqueTokoList.length})</option>
              {uniqueTokoList.map((toko) => (
                <option key={toko} value={toko}>
                  {toko}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Live Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync: <strong className="font-mono text-slate-800">{lastSyncTime}</strong></span>
          </div>

          {/* Tombol Singkronkan Data 1-Klik */}
          <button
            onClick={() => syncData(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Klik sekali untuk langsung mengambil data terbaru dari Google Spreadsheet"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyingkronkan...' : 'Singkronkan Data (1-Klik)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Ekspor ke CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>


          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#005EAA] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Tempel data banyak sekaligus dari Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Import Massal</span>
          </button>

          <button
            onClick={onAddPeserta}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-xs transition-all cursor-pointer"
            title="Tambah 1 Peserta Baru"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Peserta</span>
          </button>
        </div>
      </div>

      {/* Main Table of Participants */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Nama Peserta</th>
                <th className="py-3 px-4">Penempatan Toko</th>
                <th className="py-3 px-4">Tanggal OJT</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                // Skeletons saat memuat data
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4 text-center text-slate-300">...</td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-40" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-8 bg-slate-200 rounded w-28 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">Data Tidak Ditemukan</p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? `Tidak ada data yang cocok dengan pencarian "${searchQuery}".`
                          : 'Belum ada data peserta di sheet DATA_PESERTA. Silakan tambah peserta baru atau gunakan fitur Import Massal.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((p, idx) => (
                  <tr
                    key={p.nip}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {p.nip}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.nama}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{p.namaToko || '-'}</div>
                      <div className="text-xs text-slate-400 font-mono">Kode: {p.kodeToko || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {p.tanggalOjt || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {p.password || '••••••'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Tombol Lihat & Cetak Surat */}
                        <button
                          onClick={() => onViewSurat(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#005EAA] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                          title="Lihat & Cetak Surat Pengantar OJT"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Surat</span>
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => onEditPeserta(p)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Peserta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info row */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan {filteredList.length} dari {pesertaList.length} peserta</span>
          <span>PT. Indomarco Prismatama Cabang Surabaya</span>
        </div>
      </div>
    </div>
  );
};
