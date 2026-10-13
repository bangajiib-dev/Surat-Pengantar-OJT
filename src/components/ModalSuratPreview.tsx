import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Peserta, AsetSurat } from '../types';
import { SuratOJT } from './SuratOJT';

interface ModalSuratPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  peserta: Peserta | null;
  asetSurat?: AsetSurat | null;
}

export const ModalSuratPreview: React.FC<ModalSuratPreviewProps> = ({
  isOpen,
  onClose,
  peserta,
  asetSurat,
}) => {
  if (!isOpen || !peserta) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              Pratinjau Surat Pengantar OJT
            </h3>
            <p className="text-xs text-slate-300">
              Peserta: {peserta.nama} (NIP: {peserta.nip})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#005EAA] hover:bg-[#004b88] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-[210mm]">
            <SuratOJT peserta={peserta} asetSurat={asetSurat} />
          </div>
        </div>
      </div>
    </div>
  );
};
