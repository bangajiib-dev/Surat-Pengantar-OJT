import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Peserta } from '../types';

interface ModalImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: Peserta[]) => Promise<boolean>;
}

export const ModalImport: React.FC<ModalImportProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<Peserta[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Parser teks yang ditempel dari Excel / Google Sheets
  const handleParse = (text: string) => {
    setRawText(text);
    setErrorMsg('');

    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    const result: Peserta[] = [];

    // Cek apakah baris pertama adalah header
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (
      firstLineLower.includes('nip') ||
      firstLineLower.includes('nama') ||
      firstLineLower.includes('kode toko')
    ) {
      startIndex = 1; // Lewati header
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Pisahkan berdasarkan Tab (dari Excel) atau koma atau titik-koma
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t');
      } else if (line.includes(';')) {
        cols = line.split(';');
      } else {
        cols = line.split(',');
      }

      cols = cols.map((c) => c.replace(/^["']|["']$/g, '').trim());

      const nip = cols[0] || '';
      const nama = cols[1] || '';
      const kodeToko = cols[2] || '-';
      const namaToko = cols[3] || '-';
      const tanggalOjt = cols[4] || '-';
      const password = cols[5] || '123456';

      if (nip && nama) {
        result.push({
          nip,
          nama: nama.toUpperCase(),
          kodeToko: kodeToko.toUpperCase(),
          namaToko: namaToko.toUpperCase(),
          tanggalOjt,
          password: password || '123456',
        });
      }
    }

    setParsedRows(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content || '');
    };
    reader.readAsText(file);
  };

  const handlePasteContoh = () => {
    const contoh = `NIP\tNAMA\tKODE TOKO\tNAMA TOKO\tTANGGAL OJT\tPASSWORD
20260201\tANDI WIJAYA\tT-SBY-301\tINDOMARET BASUKI RAHMAT\tSenin, 2 Februari 2026\t123456
20260202\tNURUL HIDAYAH\tT-SDA-112\tINDOMARET SEPANJANG ASRI\tSenin, 2 Februari 2026\t123456
20260203\tFARHAN MAULANA\tT-SBY-204\tINDOMARET DIPONEGORO\tRabu, 4 Februari 2026\t123456`;
    handleParse(contoh);
  };

  const handleSubmit = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Tidak ada baris valid yang ditemukan. Pastikan kolom NIP dan NAMA terisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const ok = await onImport(parsedRows);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengimpor data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Import Massal Peserta OJT
            </h3>
            <p className="text-xs text-slate-500">
              Salin dari Excel / Spreadsheet lalu tempel di kotak teks di bawah
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Panduan Format Kolom */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center justify-between">
              <span>Urutan Kolom yang Diharapkan (A–F):</span>
              <button
                type="button"
                onClick={handlePasteContoh}
                className="text-blue-700 underline hover:text-blue-900 cursor-pointer font-medium"
              >
                Gunakan Contoh Data
              </button>
            </div>
            <p className="font-mono bg-white px-2 py-1 rounded border border-blue-200 text-[11px] text-slate-800">
              NIP | NAMA | KODE TOKO | NAMA TOKO | TANGGAL OJT | PASSWORD
            </p>
            <p className="text-[11px] text-blue-800">
              * Jika password kosong, akan otomatis diset default ke <strong>123456</strong>.
            </p>
          </div>

          {/* Area Tempel Teks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tempel Data (Excel / Spreadsheet)
              </label>
              <label className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Tempel baris data peserta di sini..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005EAA] font-mono leading-relaxed"
            />
          </div>

          {/* Preview Hasil Parsing */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data ({parsedRows.length} peserta terdeteksi):
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 border-b">No</th>
                      <th className="p-2 border-b">NIP</th>
                      <th className="p-2 border-b">Nama</th>
                      <th className="p-2 border-b">Toko</th>
                      <th className="p-2 border-b">Tanggal OJT</th>
                      <th className="p-2 border-b">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">{r.nip}</td>
                        <td className="p-2 font-medium text-slate-800">{r.nama}</td>
                        <td className="p-2 text-slate-600">{r.namaToko} ({r.kodeToko})</td>
                        <td className="p-2 text-slate-600">{r.tanggalOjt}</td>
                        <td className="p-2 font-mono text-slate-500">{r.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || parsedRows.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>Simpan {parsedRows.length} Peserta ke Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
