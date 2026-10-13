# Surat Pengantar OJT Tc Surabaya

Aplikasi web modern untuk menampilkan dan mencetak **Surat Pengantar On the Job Training (OJT) Calon Karyawan Store Crew** milik peserta OJT PT. Indomarco Prismatama (Indomaret) Cabang Surabaya, terintegrasi langsung dengan database **Google Spreadsheet** melalui **Google Apps Script Web App**.

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Format Database Google Spreadsheet](#-format-database-google-spreadsheet)
3. [Langkah Dari Nol untuk Pemula](#-langkah-dari-nol-untuk-pemula)
   - [Langkah 1: Setup Google Apps Script (Backend)](#langkah-1-setup-google-apps-script-backend)
   - [Langkah 2: Menjalankan di Komputer Sendiri (Lokal)](#langkah-2-menjalankan-di-komputer-sendiri-lokal)
   - [Langkah 3: Push ke GitHub](#langkah-3-push-ke-github)
   - [Langkah 4: Deploy ke Vercel (Online)](#langkah-4-deploy-ke-vercel-online)
4. [Daftar Environment Variables](#-daftar-environment-variables)
5. [Struktur Folder](#-struktur-folder)
6. [Kustomisasi Stempel & Tanda Tangan](#-kustomisasi-stempel--tanda-tangan)
7. [Keamanan & Pencegahan Injeksi](#-keamanan--pencegahan-injeksi)

---

## 🚀 Fitur Utama

- **Login Khusus Peserta OJT (User):**
  - Menggunakan **NIP** dan **Password** sesuai data di Google Spreadsheet.
  - Sisi server memastikan user **hanya** dapat melihat datanya sendiri. Password tidak pernah dikirimkan ke browser.
  - Di bagian atas layar menampilkan bar data user yang login (NIP, Nama, dan tombol Keluar).
- **Tampilan Surat Resmi A4 Presisi:**
  - Layout dan teks dibuat persis 100% seperti dokumen acuan resmi Training Center Cabang Surabaya.
  - Tombol **Cetak / Simpan PDF** (`window.print()`) otomatis menyembunyikan header/tombol navigasi dan memuat surat rapi 1 halaman penuh pada kertas ukuran A4.
- **Portal Admin Training Center:**
  - Kredensial admin disimpan di **Script Properties** Google Apps Script (`ADMIN_USERNAME` dan `ADMIN_PASSWORD`), bukan di sheet peserta.
  - Tabel interaktif dengan pencarian cepat (NIP, Nama, Toko) dan filter toko.
  - Fitur **Tambah Peserta**, **Edit**, dan **Hapus** (dengan popup konfirmasi).
  - Fitur **Lihat Surat**: Admin dapat melihat dan mencetak surat pengantar milik peserta mana pun kapan saja.
  - Fitur **Import Massal (Batch Import)**: Tempel salinan baris dari Excel atau unggah file CSV.
  - Fitur **Ekspor CSV**: Mengunduh seluruh data peserta ke file CSV.
- **Mode Demo / Simulasi Interaktif:**
  - Jika URL Google Apps Script belum disetel, aplikasi otomatis menyediakan akun demo bawaan sehingga langsung dapat diuji coba tanpa blank screen.

---

## 📊 Format Database Google Spreadsheet

- **Nama Sheet:** `DATA_PESERTA`
- **Urutan Kolom (A - F pada Baris 1):**

| Kolom A | Kolom B | Kolom C | Kolom D | Kolom E | Kolom F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NIP** | **NAMA** | **KODE TOKO** | **NAMA TOKO** | **TANGGAL OJT** | **PASSWORD** |
| `20260101` | AHMAD FAUZI | T-SBY-042 | INDOMARET RAYA PILANG | Senin, 19 Januari 2026 | `123456` |
| `20260102` | SITI NURHALIZA | T-SBY-088 | INDOMARET DARMO PERMAI | Senin, 19 Januari 2026 | `123456` |

> **Catatan Penting:** Kolom A (NIP) diformat sebagai **Plain Text (Teks Biasa)** agar angka nol (`0`) di awal tidak hilang.

---

## 🛠️ Langkah Dari Nol untuk Pemula

### Langkah 1: Setup Google Apps Script (Backend)

1. Buka Google Spreadsheet Anda (atau buat spreadsheet baru di Google Drive).
2. Buat sheet baru bernama **`DATA_PESERTA`** (atau biarkan skrip membuatnya otomatis).
3. Klik menu atas: **Extensions (Ekstensi)** > **Apps Script**.
4. Hapus semua teks yang ada di jendela editor kode.
5. Buka file **`apps-script/Code.gs`** dari proyek ini, salin seluruh kodenya, lalu tempelkan ke editor Apps Script.
6. Klik ikon disket **Save project (Simpan proyek)**.
7. **Mengisi Akun Admin:**
   - Di bilah menu sebelah kiri Apps Script, klik ikon gerigi **Project Settings (Setelan Proyek)**.
   - Gulir ke bawah hingga bagian **Script Properties (Properti Skrip)**.
   - Klik **Add script property (Tambahkan properti skrip)** dan masukkan:
     - Property: `ADMIN_USERNAME` | Value: `admin`
     - Property: `ADMIN_PASSWORD` | Value: `Tcsby123`
   - Klik **Save script properties (Simpan properti skrip)**.
8. **Menerapkan Web App (Deploy):**
   - Di pojok kanan atas, klik tombol biru **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
   - Klik ikon gerigi di sebelah kiri "Select type", pilih **Web app (Aplikasi web)**.
   - Isi form:
     - *Description:* `Backend Surat OJT TC Surabaya`
     - *Execute as (Jalankan sebagai):* **Me (email Google Anda)**
     - *Who has access (Yang memiliki akses):* **Anyone (Siapa saja)** *(Wajib dipilih Anyone agar aplikasi web dapat terhubung)*.
   - Klik tombol **Deploy**.
   - Jika muncul peringatan izin (Authorization Required), klik **Review permissions**, pilih akun Google Anda, klik **Advanced**, lalu klik **Go to Untitled project (unsafe)** dan klik **Allow**.
   - Setelah selesai, salin **Web app URL** yang berakhiran `/exec` (misal: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

### Langkah 2: Menjalankan di Komputer Sendiri (Lokal)

1. Pastikan komputer Anda telah terinstal **Node.js** (versi 18+).
2. Buka Terminal / Command Prompt di dalam folder proyek ini.
3. Jalankan perintah instalasi:
   ```bash
   npm install
   ```
4. Salin file contoh `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
5. Buka file `.env` dan masukkan URL Web App yang Anda salin pada Langkah 1:
   ```env
   VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbx.../exec"
   ```
6. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
7. Buka browser di alamat: `http://localhost:3000`.

---

### Langkah 3: Push ke GitHub

1. Buat repository baru di [GitHub](https://github.com/new) (misal: `surat-pengantar-ojt-tc-surabaya`).
2. Di terminal folder proyek Anda, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi Surat Pengantar OJT TC Surabaya"
   git branch -M main
   git remote add origin https://github.com/username-anda/surat-pengantar-ojt-tc-surabaya.git
   git push -u origin main
   ```

---

### Langkah 4: Deploy ke Vercel (Online)

1. Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Pilih repository GitHub Anda, lalu klik **Import**.
4. Di bagian **Environment Variables**:
   - Tambahkan variabel baru:
     - Name: `VITE_APPS_SCRIPT_URL`
     - Value: *(URL Web App Google Apps Script Anda)*
5. Klik **Deploy**.
6. Selesai! Web Anda sekarang sudah aktif dan dapat diakses publik melalui URL yang diberikan Vercel.

---

## 🔑 Daftar Environment Variables

| Variabel | Deskripsi | Wajib? |
| :--- | :--- | :--- |
| `VITE_APPS_SCRIPT_URL` | URL Google Apps Script Web App (akhiran `/exec`) | Ya (untuk mode sinkronisasi live) |

*Catatan: Jika variabel ini kosong, aplikasi otomatis beralih ke Mode Demo bawaan dengan data contoh lokal.*

---

## 📂 Struktur Folder

```
surat-pengantar-ojt/
├── public/
│   ├── stempel.svg          # Stempel vektor bulat PT Indomarco Prismatama
│   └── stempel.png          # Placeholder gambar stempel & tanda tangan
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Header aplikasi dengan warna khas Indomaret
│   │   ├── LoginForm.tsx          # Form login peserta & admin
│   │   ├── UserBar.tsx            # Bar atas peserta (NIP, Nama, Tombol Cetak)
│   │   ├── SuratOJT.tsx           # Tampilan dokumen resmi A4 sesuai gambar acuan
│   │   ├── AdminDashboard.tsx     # Tabel data peserta, filter, & statistik
│   │   ├── ModalPeserta.tsx       # Form tambah & edit peserta
│   │   ├── ModalImport.tsx        # Fitur import massal (Excel/CSV)
│   │   ├── ModalSuratPreview.tsx  # Pratinjau surat untuk admin
│   │   ├── ModalSettings.tsx      # Pengaturan koneksi URL Apps Script
│   │   ├── ModalPanduan.tsx       # Dialog panduan setup interaktif
│   │   └── Toast.tsx              # Notifikasi animasi & popup konfirmasi hapus
│   ├── services/
│   │   └── api.ts                 # Penghubung HTTP ke Google Apps Script & Mock fallback
│   ├── types/
│   │   └── index.ts               # Interface TypeScript
│   ├── App.tsx                    # Komponen utama & state management
│   ├── main.tsx                   # Entry point React
│   └── index.css                  # Tailwind CSS & konfigurasi @media print A4
├── apps-script/
│   └── Code.gs                    # Kode backend lengkap Google Apps Script
├── .env.example
├── .gitignore
├── metadata.json
├── package.json
└── README.md
```

---

## 🖋️ Kustomisasi Stempel & Tanda Tangan

Aplikasi sudah dilengkapi dengan aset stempel bulat **PT. INDOMARCO PRISMATAMA - SURABAYA** dan tanda tangan digital bawaan di file:
- `/public/stempel.png`
- `/public/stempel.svg`

Jika Anda ingin mengganti dengan hasil scan stempel asli cabang Anda:
1. Siapkan gambar scan stempel berlatar belakang transparan (format `.png`).
2. Beri nama file: `stempel.png`.
3. Ganti file yang ada di folder `/public/stempel.png`.
4. Surat otomatis akan menampilkan stempel baru Anda!

---

## 🔒 Keamanan & Pencegahan Injeksi

1. **Pencegahan Spreadsheet Formula Injection:**
   Input teks yang diawali karakter berbahaya (`=`, `+`, `-`, `@`) otomatis diberi tanda kutip satu (`'`) sebelum dimasukkan ke dalam sheet, mencegah eksekusi formula berbahaya di Google Sheets.
2. **Pencegahan Kebocoran Password:**
   Kolom password tidak pernah dikirimkan ke peramban (browser) peserta. Pencocokan dilakukan di sisi server Apps Script.
3. **Pembatasan Percobaan Login (Rate Limiting):**
   Percobaan login yang gagal berturut-turut dibatasi (maksimal 5 kali) untuk mencegah serangan brute force.
4. **Token Sesi Sementara:**
   Setelah login, server mengeluarkan token sesi berbatas waktu yang disimpan aman di memori, bukan menyimpan password mentah.
