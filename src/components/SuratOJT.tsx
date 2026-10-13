import React from 'react';
import { Peserta } from '../types';

interface SuratOJTProps {
  peserta: Peserta;
}

export const SuratOJT: React.FC<SuratOJTProps> = ({ peserta }) => {
  // Format data variabel atau tampilkan '-' jika kosong
  const nip = peserta.nip ? peserta.nip.trim() : '-';
  const nama = peserta.nama ? peserta.nama.trim().toUpperCase() : '-';
  const kodeToko = peserta.kodeToko ? peserta.kodeToko.trim() : '-';
  const namaToko = peserta.namaToko ? peserta.namaToko.trim().toUpperCase() : '-';
  const tanggalOjt = peserta.tanggalOjt ? peserta.tanggalOjt.trim() : '-';

  return (
    <div className="surat-container w-full max-w-[210mm] mx-auto bg-white text-black font-doc shadow-xl border border-slate-200 print:border-none print:shadow-none p-8 md:p-12 print:p-0 my-4 text-[13px] leading-[1.38]">
      {/* HEADER SURAT */}
      <div className="flex items-start justify-between mb-2">
        {/* Logo Kiri Atas */}
        <div className="flex flex-col items-start">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Indomaret.svg"
            alt="Logo Indomaret"
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-[11px] font-bold tracking-wider text-slate-900 mt-1">
            TRAINING CENTER
          </span>
        </div>

        {/* Judul Tengah Atas */}
        <div className="text-center flex-1 pr-14 pt-1">
          <h1 className="text-[16px] font-bold tracking-wide underline decoration-black decoration-1 underline-offset-2">
            SURAT PENGANTAR OJT
          </h1>
          <h2 className="text-[14px] font-bold tracking-wide mt-0.5">
            (CALON KARYAWAN STORE CREW)
          </h2>
        </div>
      </div>

      {/* METADATA PENERIMA & PENGIRIM */}
      <div className="mt-3 text-[13px] leading-tight space-y-1">
        <div className="grid grid-cols-[110px_12px_1fr]">
          <span className="font-normal">Kepada Yth</span>
          <span>:</span>
          <span>Chief of Store/Store Sr.Leader</span>
        </div>
        <div className="grid grid-cols-[110px_12px_1fr]">
          <span className="font-normal">Dari</span>
          <span>:</span>
          <span>Training Center Cabang Surabaya</span>
        </div>
        <div className="grid grid-cols-[110px_12px_1fr]">
          <span className="font-normal">Alamat</span>
          <span>:</span>
          <span>Jl. Raya Pilang KM 8,2 Ds. Pilang Kec Wonoayu Kab Sidoarjo</span>
        </div>
        <div className="grid grid-cols-[110px_12px_1fr]">
          <span className="font-normal">Email</span>
          <span>:</span>
          <span>hrd_spv_trn_1@sby.indomaret.co.id</span>
        </div>
        <div className="grid grid-cols-[110px_12px_1fr]">
          <span className="font-normal">Hal</span>
          <span>:</span>
          <span>
            On the Job Training (OJT){' '}
            <span className="word-spellcheck-red">Peserta Calon Karyawan</span> Store Crew
          </span>
        </div>
      </div>

      {/* GARIS PEMISAH HORIZONTAL */}
      <hr className="border-t-[1.5px] border-black my-2.5" />

      {/* SALAM PEMBUKA & PENGANTAR */}
      <div className="space-y-1">
        <p>Dengan hormat,</p>
        <p>Bersama surat ini kami kirimkan peserta OJT dengan data sebagai berikut :</p>
      </div>

      {/* TABEL DATA PESERTA */}
      <div className="my-2 ml-1 text-[13px] leading-snug">
        <table className="border-collapse w-full max-w-[480px]">
          <tbody>
            <tr>
              <td className="w-28 py-0.5 align-top">NIP</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-normal tracking-wide">{nip}</td>
            </tr>
            <tr>
              <td className="w-28 py-0.5 align-top">Nama</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-normal tracking-wide">{nama}</td>
            </tr>
            <tr>
              <td className="w-28 py-0.5 align-top">Kode Toko</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-normal tracking-wide">{kodeToko}</td>
            </tr>
            <tr>
              <td className="w-28 py-0.5 align-top">Nama Toko</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-normal tracking-wide">{namaToko}</td>
            </tr>
            <tr>
              <td className="w-28 py-0.5 align-top">Jabatan</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-bold tracking-wide">STORE CREW</td>
            </tr>
            <tr>
              <td className="w-28 py-0.5 align-top">Tanggal OJT</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-normal tracking-wide">{tanggalOjt}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* KETENTUAN OJT */}
      <div className="mt-3">
        <h3 className="text-center font-bold underline decoration-black decoration-1 text-[13px] mb-1.5">
          Ketentuan OJT:
        </h3>
        <ol className="list-decimal list-outside ml-6 space-y-1 text-justify">
          <li className="pl-1">
            Peserta OJT <span className="font-bold">WAJIB</span> masuk bersama Chief of Store/Store Sr.Leader.
          </li>
          <li className="pl-1">
            <span className="font-bold">Tugas utama</span> peserta selama OJT adalah{' '}
            <span className="font-bold">belajar</span> dan{' '}
            <span className="font-bold">mempraktekkan</span> materi dari TC Surabaya
          </li>
          <li className="pl-1">
            Materi yang dipraktekkan selama OJT sesuai dengan{' '}
            <span className="font-bold">daftar terlampir</span> (disesuaikan kondisi toko).
          </li>
          <li className="pl-1">
            <span className="font-bold">Jadwal masuk</span> shift OJT, berganti dari hari sebelumnya.
          </li>
        </ol>
      </div>

      {/* TUGAS CHIEF OF STORE / STORE SR. LEADER PENGAJAR */}
      <div className="mt-3">
        <h3 className="text-center font-bold text-[13px] mb-1.5 underline decoration-black decoration-1">
          <span className="word-spellcheck-red">Tugas</span> Chief of Store/Store Sr.Leader{' '}
          <span className="word-spellcheck-red">Pengajar</span> :
        </h3>
        <ol className="list-decimal list-outside ml-6 space-y-1 text-justify">
          <li className="pl-1">
            <span className="font-bold">Memberikan bimbingan</span> kepada Peserta OJT agar proses belajar berjalan dengan baik.
          </li>
          <li className="pl-1">
            Melakukan <span className="font-bold">briefing tim toko</span> agar dapat{' '}
            <span className="font-bold">memberi contoh yang baik</span> dan{' '}
            <span className="font-bold">melakukan pekerjaan sesuai dengan SOP perusahaan</span> sehingga{' '}
            <span className="font-bold">pembelajaran</span> di toko sama dengan materi yang disampaikan selama pelatihan di TC Surabaya
          </li>
          <li className="pl-1">
            <span className="font-bold">Melaporkan</span> kepada trainer pembimbing terkait sikap dan pelanggaran peserta.
          </li>
          <li className="pl-1">
            Memberikan <span className="font-bold">penilaian</span> terhadap Peserta OJT dalam hal{' '}
            <span className="font-bold">SIKAP PELAKSANAAN TUGAS</span> dan{' '}
            <span className="font-bold">KESESUAIAN STANDAR KERJA INDOMARET</span> (
            <span className="font-bold">link Google Form</span>).
          </li>
          <li className="pl-1">
            Penilaian OJT dilakukan oleh <span className="font-bold">CIF/SSL</span> melalui{' '}
            <span className="font-bold">link Google Form</span> yang sudah di share oleh TC cabang.
          </li>
          <li className="pl-1">
            <span className="font-bold">Melakukan evaluasi</span> test praktek transaksi di hari terakhir OJT peserta.
          </li>
        </ol>
      </div>

      {/* PENUTUP & KONTAK DARURAT */}
      <div className="mt-3.5 space-y-1 text-[12.5px]">
        <p>Demikian surat pengantar kami, terimakasih atas kerjasamanya.</p>
        <p>
          Untuk Informasi penting dan mendesak (di luar hari dan jam kerja) hubungi{' '}
          <span className="font-bold italic">Abdul Rokhman/0813-3260-3606</span>
        </p>
      </div>

      {/* TANDA TANGAN & STEMPEL (KANAN BAWAH) */}
      <div className="mt-4 flex justify-end">
        <div className="text-center w-60 relative flex flex-col items-center">
          <p className="font-normal text-[13px] mb-1">Training Center Surabaya</p>

          {/* Area Stempel & Tanda Tangan */}
          <div className="relative w-40 h-24 my-0.5 flex items-center justify-center">
            {/* Stempel bulat PT Indomarco Prismatama + Tanda tangan */}
            <img
              src="/stempel.png"
              alt="Stempel PT Indomarco Prismatama Training Center Surabaya"
              className="w-36 h-36 object-contain pointer-events-none select-none drop-shadow-sm -my-4"
              onError={(e) => {
                // Fallback otomatis ke SVG jika file PNG belum diganti user
                const target = e.currentTarget;
                if (!target.src.endsWith('.svg')) {
                  target.src = '/stempel.svg';
                }
              }}
            />
          </div>

          {/* Nama Penanda Tangan */}
          <p className="font-normal text-[13px] underline decoration-black decoration-1 underline-offset-2">
            Abdul Rokhman K
          </p>
        </div>
      </div>
    </div>
  );
};
