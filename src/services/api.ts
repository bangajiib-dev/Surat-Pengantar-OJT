import { ApiResponse, Peserta, UserSession, AdminSession } from '../types';

// Ambil URL dari environment variable atau dari localStorage
const ENV_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';
const STORAGE_KEY_URL = 'tc_sby_apps_script_url';
const STORAGE_KEY_SESSION = 'tc_sby_auth_session';

export function getAppsScriptUrl(): string {
  const customUrl = localStorage.getItem(STORAGE_KEY_URL);
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  return ENV_URL.trim();
}

export function setCustomAppsScriptUrl(url: string) {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }
}

/**
 * Panggil API Google Apps Script melalui HTTP POST
 * Menggunakan mode text/plain untuk menghindari CORS preflight OPTIONS blocking
 */
async function callAppsScript<T = any>(payload: Record<string, any>): Promise<ApiResponse<T>> {
  const url = getAppsScriptUrl();

  if (!url) {
    return {
      success: false,
      message: 'URL Google Apps Script belum disetel. Silakan masukkan URL Web App Apps Script melalui menu Pengaturan atau file .env.'
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error: any) {
    console.error("Gagal terhubung ke database Google Spreadsheet:", error);
    return {
      success: false,
      message: `Gagal terhubung ke Google Spreadsheet: ${error.message || 'Periksa koneksi internet atau izin Web App Apps Script'}.`
    };
  }
}

// Export API Client
export const api = {
  // Test koneksi & inisialisasi sheet
  ping: () => callAppsScript({ action: 'ping' }),
  initSheet: () => callAppsScript({ action: 'initSheet' }),

  // Login peserta OJT (mencocokkan NIP & Password di sheet DATA_PESERTA)
  loginUser: (nip: string, password: string) =>
    callAppsScript({ action: 'loginUser', nip, password }),

  // Login Admin TC (menggunakan kredensial Script Properties, default: admin / Tcsby123)
  loginAdmin: (username: string, password: string) =>
    callAppsScript({ action: 'loginAdmin', username, password }),

  // Dapatkan profil terbaru peserta (untuk live background sync di tampilan peserta)
  getProfile: (token: string) =>
    callAppsScript<{ role: 'user' | 'admin'; user?: Peserta; admin?: { username: string } }>({
      action: 'getProfile',
      token
    }),

  // Ambil semua data peserta live dari spreadsheet (Khusus Admin)
  getAllPeserta: (token: string) =>
    callAppsScript<Peserta[]>({ action: 'getAllPeserta', token }),

  // Tambah peserta ke baris baru sheet DATA_PESERTA
  addPeserta: (token: string, peserta: Peserta) =>
    callAppsScript({ action: 'addPeserta', token, peserta }),

  // Update peserta di sheet DATA_PESERTA
  updatePeserta: (token: string, oldNip: string, peserta: Peserta) =>
    callAppsScript({ action: 'updatePeserta', token, oldNip, peserta }),

  // Hapus peserta dari baris sheet DATA_PESERTA
  deletePeserta: (token: string, nip: string) =>
    callAppsScript({ action: 'deletePeserta', token, nip }),

  // Import Massal banyak peserta sekaligus ke sheet DATA_PESERTA
  batchImportPeserta: (token: string, rows: Peserta[]) =>
    callAppsScript({ action: 'batchImportPeserta', token, rows }),

  // Ambil aset gambar surat (Tanda Tangan & Stempel) dari Google Drive
  getAsetSurat: (token: string) =>
    callAppsScript<{ ttd: string | null; stempel: string | null }>({ action: 'getAsetSurat', token }),

  // Simpan aset gambar surat ke Google Drive (Khusus Admin)
  simpanAsetSurat: (token: string, jenis: 'ttd' | 'stempel', data: string, mimeType: string) =>
    callAppsScript({ action: 'simpanAsetSurat', token, jenis, data, mimeType }),

  // Hapus aset gambar surat dari Google Drive (Khusus Admin)
  hapusAsetSurat: (token: string, jenis: 'ttd' | 'stempel') =>
    callAppsScript({ action: 'hapusAsetSurat', token, jenis })
};

const STORAGE_KEY_ASET = 'tc_sby_aset_surat';

export function getCachedAsetSurat(): { ttd: string | null; stempel: string | null } {
  const raw = localStorage.getItem(STORAGE_KEY_ASET);
  if (!raw) return { ttd: null, stempel: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { ttd: null, stempel: null };
  }
}

export function saveCachedAsetSurat(aset: { ttd: string | null; stempel: string | null }) {
  localStorage.setItem(STORAGE_KEY_ASET, JSON.stringify(aset));
}

// Helper Sesi
export function saveSession(session: UserSession | AdminSession) {
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
}

export function getSavedSession(): UserSession | AdminSession | null {
  const raw = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}
