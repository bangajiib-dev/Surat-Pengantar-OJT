/**
 * ============================================================================
 * SURAT PENGANTAR OJT TC SURABAYA - BACKEND GOOGLE APPS SCRIPT
 * PT. INDOMARCO PRISMATAMA (INDOMARET) CABANG SURABAYA
 * ============================================================================
 * Sheet Name: DATA_PESERTA
 * Kolom (A - F): NIP | NAMA | KODE TOKO | NAMA TOKO | TANGGAL OJT | PASSWORD
 *
 * CARA SETUP:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode bawaan, lalu tempel SELURUH isi file ini.
 * 4. Klik ikon gerigi (Project Settings / Setelan Proyek) di bilah kiri.
 * 5. Gulir ke 'Script Properties' (Properti Skrip), klik 'Add script property':
 *    - ADMIN_USERNAME : (misal: admin)
 *    - ADMIN_PASSWORD : (misal: Tcsby123)
 * 6. Klik tombol biru 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru).
 *    - Pilih jenis: Web app (Aplikasi Web).
 *    - Description: Backend Surat OJT TC Surabaya
 *    - Execute as: Me (email akun Google Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 7. Klik 'Deploy', izinkan akses (Authorize Access / Review Permissions).
 * 8. Salin URL Web App yang berakhiran '/exec'.
 * 9. Tempelkan URL tersebut ke file .env di frontend (VITE_APPS_SCRIPT_URL).
 * ============================================================================
 */

var SHEET_NAME = "DATA_PESERTA";
var HEADERS = ["NIP", "NAMA", "KODE TOKO", "NAMA TOKO", "TANGGAL OJT", "PASSWORD"];
var MAX_FAILED_ATTEMPTS = 5;
var LOCKOUT_SECONDS = 300; // 5 menit

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  return handleRequest(e ? e.parameter : {});
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  var data = {};
  if (e && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      // Jika dikirim via form-urlencoded
      data = e.parameter || {};
    }
  } else if (e && e.parameter) {
    data = e.parameter;
  }
  return handleRequest(data);
}

/**
 * Router utama untuk semua request
 */
function handleRequest(params) {
  var action = params.action || "ping";
  var result = { success: false, message: "Aksi tidak dikenali" };

  try {
    switch (action) {
      case "ping":
        result = {
          success: true,
          message: "Apps Script TC Surabaya Online",
          timestamp: new Date().toISOString(),
          sheetConnected: !!getSpreadsheet()
        };
        break;

      case "initSheet":
        result = initializeSheet();
        break;

      case "loginUser":
        result = loginUser(params.nip, params.password);
        break;

      case "loginAdmin":
        result = loginAdmin(params.username, params.password);
        break;

      case "getProfile":
        result = getProfile(params.token);
        break;

      case "getAllPeserta":
        result = getAllPeserta(params.token);
        break;

      case "addPeserta":
        result = addPeserta(params.token, params.peserta);
        break;

      case "updatePeserta":
        result = updatePeserta(params.token, params.oldNip, params.peserta);
        break;

      case "deletePeserta":
        result = deletePeserta(params.token, params.nip);
        break;

      case "batchImportPeserta":
        result = batchImportPeserta(params.token, params.rows);
        break;

      default:
        result = { success: false, message: "Aksi '" + action + "' tidak valid." };
    }
  } catch (error) {
    result = {
      success: false,
      message: "Terjadi kesalahan di server: " + (error.message || error.toString())
    };
  }

  return createJsonResponse(result);
}

/**
 * Menghasilkan JSON Response yang aman dengan header CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Dapatkan Spreadsheet aktif atau buat sheet DATA_PESERTA jika belum ada
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrInitSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tulis header
    sheet.appendRow(HEADERS);
    // Format header: Bold, latar biru Indomaret, teks putih
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#005EAA");
    headerRange.setFontColor("#FFFFFF");
    // Format kolom A (NIP) dan F (PASSWORD) sebagai Plain Text
    sheet.getRange("A:A").setNumberFormat("@");
    sheet.getRange("F:F").setNumberFormat("@");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function initializeSheet() {
  var sheet = getOrInitSheet();
  return {
    success: true,
    message: "Sheet " + SHEET_NAME + " siap digunakan.",
    totalRows: sheet.getLastRow()
  };
}

/**
 * Sanitasi untuk mencegah Formula Injection (CSV / Sheets Injection)
 */
function sanitizeCellValue(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.length > 0) {
    var firstChar = str.charAt(0);
    if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@") {
      return "'" + str;
    }
  }
  return str;
}

/**
 * Format tanggal ke teks Indonesia yang rapi jika berupa objek Date
 */
function formatTanggalIndo(val) {
  if (!val) return "-";
  if (Object.prototype.toString.call(val) === "[object Date]") {
    var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    var bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    var namaHari = hari[val.getDay()];
    var tgl = val.getDate();
    var namaBulan = bulan[val.getMonth()];
    var thn = val.getFullYear();
    return namaHari + ", " + tgl + " " + namaBulan + " " + thn;
  }
  return String(val).trim();
}

/**
 * Manajemen Token Sesi menggunakan CacheService
 */
function generateToken(payload) {
  var token = Utilities.getUuid();
  var cache = CacheService.getScriptCache();
  // Sesi berlaku 6 jam (21600 detik)
  cache.put("token_" + token, JSON.stringify(payload), 21600);
  return token;
}

function verifyToken(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var data = cache.get("token_" + token);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Rate Limiter untuk percobaan login gagal
 */
function checkRateLimit(key) {
  var cache = CacheService.getScriptCache();
  var attemptsKey = "rate_limit_" + key;
  var attempts = parseInt(cache.get(attemptsKey) || "0", 10);
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    return false;
  }
  return true;
}

function recordFailedAttempt(key) {
  var cache = CacheService.getScriptCache();
  var attemptsKey = "rate_limit_" + key;
  var attempts = parseInt(cache.get(attemptsKey) || "0", 10) + 1;
  cache.put(attemptsKey, String(attempts), LOCKOUT_SECONDS);
}

function resetFailedAttempts(key) {
  var cache = CacheService.getScriptCache();
  cache.remove("rate_limit_" + key);
}

/**
 * ----------------------------------------------------------------------------
 * LOGIN USER (PESERTA OJT)
 * ----------------------------------------------------------------------------
 * Cocokkan NIP (string trim) dan PASSWORD dari sheet DATA_PESERTA.
 * PASSWORD TIDAK PERNAH DIKIRIMKAN KE BROWSER!
 */
function loginUser(nip, password) {
  if (!nip || !password) {
    return { success: false, message: "NIP dan Password wajib diisi." };
  }

  var cleanNip = String(nip).trim();
  var cleanPass = String(password).trim();

  if (!checkRateLimit("user_" + cleanNip)) {
    return {
      success: false,
      message: "Terlalu banyak percobaan gagal. Silakan tunggu 5 menit lagi."
    };
  }

  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    recordFailedAttempt("user_" + cleanNip);
    return { success: false, message: "Data peserta belum tersedia di database." };
  }

  // Baca seluruh data baris 2 hingga terakhir
  var dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
  var values = dataRange.getDisplayValues(); // Gunakan getDisplayValues agar NIP dibaca sebagai teks persis

  var matched = null;
  for (var i = 0; i < values.length; i++) {
    var rowNip = String(values[i][0] || "").trim();
    var rowPass = String(values[i][5] || "").trim();

    if (rowNip === cleanNip) {
      if (rowPass === cleanPass) {
        matched = {
          nip: rowNip,
          nama: String(values[i][1] || "").trim(),
          kodeToko: String(values[i][2] || "").trim(),
          namaToko: String(values[i][3] || "").trim(),
          tanggalOjt: formatTanggalIndo(values[i][4])
        };
        break;
      } else {
        recordFailedAttempt("user_" + cleanNip);
        return { success: false, message: "Password yang Anda masukkan salah." };
      }
    }
  }

  if (!matched) {
    recordFailedAttempt("user_" + cleanNip);
    return { success: false, message: "NIP tidak ditemukan dalam database." };
  }

  resetFailedAttempts("user_" + cleanNip);

  // Buat token sementara
  var token = generateToken({
    role: "user",
    nip: matched.nip,
    nama: matched.nama
  });

  return {
    success: true,
    message: "Login berhasil",
    token: token,
    role: "user",
    user: matched // TANPA PASSWORD
  };
}

/**
 * ----------------------------------------------------------------------------
 * LOGIN ADMIN
 * ----------------------------------------------------------------------------
 * Diambil dari Script Properties: ADMIN_USERNAME dan ADMIN_PASSWORD
 */
function loginAdmin(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username dan Password Admin wajib diisi." };
  }

  var cleanUser = String(username).trim();
  var cleanPass = String(password).trim();

  if (!checkRateLimit("admin_" + cleanUser)) {
    return {
      success: false,
      message: "Terlalu banyak percobaan gagal admin. Silakan tunggu 5 menit."
    };
  }

  var props = PropertiesService.getScriptProperties();
  var savedUser = props.getProperty("ADMIN_USERNAME");
  var savedPass = props.getProperty("ADMIN_PASSWORD");

  // Jika belum diset di Script Properties, gunakan default darurat aman atau beri petunjuk
  if (!savedUser || !savedPass) {
    // Default akun admin
    savedUser = "admin";
    savedPass = "Tcsby123";
    props.setProperty("ADMIN_USERNAME", savedUser);
    props.setProperty("ADMIN_PASSWORD", savedPass);
  }

  if (cleanUser === savedUser && cleanPass === savedPass) {
    resetFailedAttempts("admin_" + cleanUser);
    var token = generateToken({
      role: "admin",
      username: cleanUser
    });
    return {
      success: true,
      message: "Login Admin berhasil",
      token: token,
      role: "admin",
      admin: { username: cleanUser }
    };
  }

  recordFailedAttempt("admin_" + cleanUser);
  return { success: false, message: "Username atau Password Admin salah." };
}

/**
 * Verifikasi profil dari token aktif
 */
function getProfile(token) {
  var session = verifyToken(token);
  if (!session) {
    return { success: false, message: "Sesi telah berakhir. Silakan login kembali." };
  }

  if (session.role === "admin") {
    return {
      success: true,
      role: "admin",
      admin: { username: session.username }
    };
  }

  // Jika user, ambil data terbaru dari sheet
  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, message: "Data tidak ditemukan." };
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === session.nip) {
      return {
        success: true,
        role: "user",
        user: {
          nip: String(values[i][0]).trim(),
          nama: String(values[i][1]).trim(),
          kodeToko: String(values[i][2]).trim(),
          namaToko: String(values[i][3]).trim(),
          tanggalOjt: formatTanggalIndo(values[i][4])
        }
      };
    }
  }

  return { success: false, message: "Data user tidak ditemukan di database." };
}

/**
 * ----------------------------------------------------------------------------
 * CRUD OPERASI ADMIN
 * ----------------------------------------------------------------------------
 */

/**
 * Ambil semua peserta (HANYA ADMIN)
 */
function getAllPeserta(token) {
  var session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return { success: false, message: "Akses ditolak. Hanya untuk Admin." };
  }

  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, data: [] };
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
  var list = [];
  for (var i = 0; i < values.length; i++) {
    var nip = String(values[i][0] || "").trim();
    if (nip) {
      list.push({
        nip: nip,
        nama: String(values[i][1] || "").trim(),
        kodeToko: String(values[i][2] || "").trim(),
        namaToko: String(values[i][3] || "").trim(),
        tanggalOjt: formatTanggalIndo(values[i][4]),
        password: String(values[i][5] || "").trim() // Dikirim khusus untuk admin agar bisa diedit
      });
    }
  }

  return { success: true, data: list };
}

/**
 * Tambah 1 Peserta baru
 */
function addPeserta(token, p) {
  var session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return { success: false, message: "Akses ditolak. Hanya untuk Admin." };
  }

  if (!p || !p.nip || !p.nama) {
    return { success: false, message: "NIP dan Nama wajib diisi." };
  }

  var cleanNip = String(p.nip).trim();
  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();

  // Cek duplikasi NIP
  if (lastRow > 1) {
    var existingNips = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < existingNips.length; i++) {
      if (String(existingNips[i][0]).trim() === cleanNip) {
        return { success: false, message: "Peserta dengan NIP " + cleanNip + " sudah ada." };
      }
    }
  }

  var row = [
    sanitizeCellValue(cleanNip),
    sanitizeCellValue(p.nama),
    sanitizeCellValue(p.kodeToko || "-"),
    sanitizeCellValue(p.namaToko || "-"),
    sanitizeCellValue(p.tanggalOjt || "-"),
    sanitizeCellValue(p.password || "123456")
  ];

  sheet.appendRow(row);
  // Pastikan format teks
  var newRowIdx = sheet.getLastRow();
  sheet.getRange(newRowIdx, 1).setNumberFormat("@");
  sheet.getRange(newRowIdx, 6).setNumberFormat("@");

  return {
    success: true,
    message: "Peserta " + p.nama + " berhasil ditambahkan.",
    peserta: {
      nip: cleanNip,
      nama: p.nama,
      kodeToko: p.kodeToko || "-",
      namaToko: p.namaToko || "-",
      tanggalOjt: p.tanggalOjt || "-",
      password: p.password || "123456"
    }
  };
}

/**
 * Update data peserta
 */
function updatePeserta(token, oldNip, p) {
  var session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return { success: false, message: "Akses ditolak. Hanya untuk Admin." };
  }

  var targetNip = String(oldNip).trim();
  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, message: "Data tidak ditemukan." };
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var foundRow = -1;
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === targetNip) {
      foundRow = i + 2; // Offset header
      break;
    }
  }

  if (foundRow === -1) {
    return { success: false, message: "Peserta dengan NIP " + targetNip + " tidak ditemukan." };
  }

  var newNip = String(p.nip || oldNip).trim();
  var range = sheet.getRange(foundRow, 1, 1, 6);
  var updatedRow = [
    sanitizeCellValue(newNip),
    sanitizeCellValue(p.nama),
    sanitizeCellValue(p.kodeToko || "-"),
    sanitizeCellValue(p.namaToko || "-"),
    sanitizeCellValue(p.tanggalOjt || "-"),
    sanitizeCellValue(p.password || "123456")
  ];

  range.setValues([updatedRow]);
  sheet.getRange(foundRow, 1).setNumberFormat("@");
  sheet.getRange(foundRow, 6).setNumberFormat("@");

  return {
    success: true,
    message: "Data peserta berhasil diperbarui.",
    peserta: {
      nip: newNip,
      nama: p.nama,
      kodeToko: p.kodeToko,
      namaToko: p.namaToko,
      tanggalOjt: p.tanggalOjt,
      password: p.password
    }
  };
}

/**
 * Hapus peserta
 */
function deletePeserta(token, nip) {
  var session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return { success: false, message: "Akses ditolak. Hanya untuk Admin." };
  }

  var targetNip = String(nip).trim();
  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, message: "Data tidak ditemukan." };
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var foundRow = -1;
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === targetNip) {
      foundRow = i + 2;
      break;
    }
  }

  if (foundRow === -1) {
    return { success: false, message: "Peserta dengan NIP " + targetNip + " tidak ditemukan." };
  }

  sheet.deleteRow(foundRow);
  return { success: true, message: "Peserta dengan NIP " + targetNip + " berhasil dihapus." };
}

/**
 * Import Massal Banyak Peserta Sekaligus (Batch Import)
 */
function batchImportPeserta(token, rows) {
  var session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return { success: false, message: "Akses ditolak. Hanya untuk Admin." };
  }

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { success: false, message: "Data baris import kosong." };
  }

  var sheet = getOrInitSheet();
  var lastRow = sheet.getLastRow();
  var existingNipMap = {};

  if (lastRow > 1) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < existing.length; i++) {
      existingNipMap[String(existing[i][0]).trim()] = i + 2;
    }
  }

  var addedCount = 0;
  var updatedCount = 0;
  var newRows = [];

  for (var j = 0; j < rows.length; j++) {
    var r = rows[j];
    var nip = String(r.nip || "").trim();
    var nama = String(r.nama || "").trim();
    if (!nip || !nama) continue;

    var sanitizedRow = [
      sanitizeCellValue(nip),
      sanitizeCellValue(nama),
      sanitizeCellValue(r.kodeToko || "-"),
      sanitizeCellValue(r.namaToko || "-"),
      sanitizeCellValue(r.tanggalOjt || "-"),
      sanitizeCellValue(r.password || "123456")
    ];

    if (existingNipMap[nip]) {
      // Update baris lama
      var targetRowIdx = existingNipMap[nip];
      sheet.getRange(targetRowIdx, 1, 1, 6).setValues([sanitizedRow]);
      sheet.getRange(targetRowIdx, 1).setNumberFormat("@");
      sheet.getRange(targetRowIdx, 6).setNumberFormat("@");
      updatedCount++;
    } else {
      // Masukkan ke antrean baris baru
      newRows.push(sanitizedRow);
      existingNipMap[nip] = true;
      addedCount++;
    }
  }

  if (newRows.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, newRows.length, 6).setValues(newRows);
    sheet.getRange(startRow, 1, newRows.length, 1).setNumberFormat("@");
    sheet.getRange(startRow, 6, newRows.length, 1).setNumberFormat("@");
  }

  return {
    success: true,
    message: "Import selesai: " + addedCount + " peserta baru ditambah, " + updatedCount + " peserta diperbarui.",
    addedCount: addedCount,
    updatedCount: updatedCount
  };
}
