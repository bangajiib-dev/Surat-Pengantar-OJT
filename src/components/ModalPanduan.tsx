import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, HelpCircle, FileCode, Server, Terminal, Globe, Key } from 'lucide-react';

interface ModalPanduanProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const ModalPanduan: React.FC<ModalPanduanProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'appscript' | 'local' | 'vercel'>('appscript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      // Fetch atau salin isi Code.gs
      const res = await fetch('/apps-script/Code.gs');
      let text = '';
      if (res.ok) {
        text = await res.text();
      } else {
        // Fallback jika path web tidak langsung serving apps-script
        text = `// Silakan buka file /apps-script/Code.gs di proyek Anda untuk menyalin kode lengkapnya.`;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('success', 'Kode Disalin', 'Kode Code.gs berhasil disalin ke clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('info', 'File Code.gs', 'Silakan buka file apps-script/Code.gs pada folder aplikasi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#005EAA] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="font-bold text-base">
                Panduan Langkah Demi Langkah (Untuk Pemula)
              </h3>
              <p className="text-xs text-blue-100">
                Setup Google Spreadsheet, Apps Script, Lokal, dan Deploy ke Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('appscript')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'appscript'
                ? 'border-[#005EAA] text-[#005EAA] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Google Apps Script (Backend)</span>
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'local'
                ? 'border-[#005EAA] text-[#005EAA] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. Jalankan di Komputer</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'vercel'
                ? 'border-[#005EAA] text-[#005EAA] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. Deploy ke Vercel</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'appscript' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#005EAA] text-sm">
                    Kode Backend: <code>apps-script/Code.gs</code>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Kode ini yang akan membaca dan menulis data ke sheet <strong>DATA_PESERTA</strong> di Google Spreadsheet Anda.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Code.gs'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#005EAA] font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Buka Spreadsheet & Ekstensi</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Buka Google Spreadsheet Anda (atau buat spreadsheet baru). Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#005EAA] font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Tempel Kode Code.gs</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Hapus semua kode bawaan di editor Apps Script, lalu tempel seluruh isi file <code>Code.gs</code> yang sudah disediakan di folder <code>/apps-script/Code.gs</code>. Klik ikon Disket (Simpan).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#005EAA] font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Atur Akun Admin di Script Properties</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Di bilah kiri Apps Script, klik ikon gerigi <strong>Setelan Proyek (Project Settings)</strong>. Gulir ke bagian <strong>Properti Skrip (Script Properties)</strong>, klik <strong>Tambahkan properti skrip</strong>:
                    </p>
                    <div className="mt-2 bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                      <div><strong className="text-slate-800">ADMIN_USERNAME</strong> : admin</div>
                      <div><strong className="text-slate-800">ADMIN_PASSWORD</strong> : Tcsby123</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#005EAA] font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Deploy sebagai Web App (Penting!)</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>Penerapan baru (New deployment)</strong>:
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-600 mt-1 space-y-1">
                      <li>Pilih jenis ikon gerigi: <strong>Aplikasi web (Web app)</strong></li>
                      <li>Jalankan sebagai (Execute as): <strong>Saya (email Google Anda)</strong></li>
                      <li>Yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong> <span className="text-red-600 font-bold">*Wajib Anyone agar web bisa menghubungi</span></li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#005EAA] font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Salin URL Web App</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Klik <strong>Deploy</strong>, izinkan akses saat diminta (Review Permissions &gt; Advanced &gt; Go to Untitled project). Setelah selesai, salin <strong>URL Aplikasi Web</strong> yang berakhiran <code>/exec</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Cara menjalankan aplikasi ini di laptop/komputer Anda:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-2">
                  <div className="text-slate-400"># 1. Buka terminal di folder proyek lalu install dependensi</div>
                  <div className="text-emerald-400">npm install</div>
                  
                  <div className="text-slate-400 pt-2"># 2. Buat file .env dari contoh</div>
                  <div className="text-emerald-400">cp .env.example .env</div>

                  <div className="text-slate-400 pt-2"># 3. Buka file .env dan masukkan URL Apps Script yang tadi disalin</div>
                  <div className="text-yellow-300">VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbx.../exec"</div>

                  <div className="text-slate-400 pt-2"># 4. Jalankan server lokal</div>
                  <div className="text-emerald-400">npm run dev</div>
                </div>

                <p className="text-xs text-slate-600">
                  Buka browser di alamat <code>http://localhost:3000</code>. Aplikasi Anda siap digunakan!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Cara men-deploy ke Vercel agar dapat diakses online oleh seluruh peserta OJT:
              </p>

              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-600">
                <li>
                  <strong>Push proyek ke GitHub:</strong>
                  <div className="mt-1 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px]">
                    git add .<br />
                    git commit -m "Surat Pengantar OJT TC Surabaya siap"<br />
                    git push origin main
                  </div>
                </li>
                <li>
                  Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a>, masuk dengan akun GitHub Anda.
                </li>
                <li>
                  Klik <strong>Add New...</strong> &gt; <strong>Project</strong>, lalu pilih repository GitHub Anda.
                </li>
                <li>
                  Di bagian <strong>Environment Variables</strong>:
                  <div className="mt-1 p-2.5 bg-slate-100 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px]">
                    Key: <strong>VITE_APPS_SCRIPT_URL</strong><br />
                    Value: <em>URL Web App Apps Script Anda</em>
                  </div>
                </li>
                <li>
                  Klik tombol <strong>Deploy</strong>. Dalam 1-2 menit, web Anda aktif dengan domain gratis dari Vercel (misal: <code>https://surat-ojt-tc-sby.vercel.app</code>)!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg transition-colors cursor-pointer"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
