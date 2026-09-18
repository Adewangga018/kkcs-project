# Panduan Testing Mandiri — Admin Console KKCS

Dokumen ini berisi data dummy yang sudah disiapkan di database (bukan mock — data nyata lewat API,
supaya jurnal akuntansi & audit trail-nya ikut konsisten) beserta langkah-langkah testing per menu.

> **Update 14 Sep 2026**: seluruh data dummy sebelumnya (akun ANG001–ANG005, transaksi, jurnal, dan
> SHU run lama) sudah dihapus total dan dibuat ULANG dari nol lewat API asli — Neraca sekarang mulai
> seimbang dari Rp 0 lagi. Skenario di bawah ini sudah diperbarui dan diverifikasi berjalan (Neraca
> selisih = 0 setelah seeding).

- **Admin console**: http://localhost:5173
- **Backend API**: http://localhost:5168
- **Login Anda (ASD)**: tetap sebagai Admin, pakai kredensial Anda sendiri seperti biasa.

> Kalau backend belum jalan, jalankan `dotnet run` di folder `backend/`.

---

## 1. Akun dummy anggota

Semua pakai password yang sama supaya gampang diingat.

| Nama | NIK | Password | Status | Peran skenario |
|---|---|---|---|---|
| Budi Santoso | `ANG001` | `Anggota123!` | Aktif | Simpanan wajib+sukarela disetujui, pinjaman **Lunas** (pelunasan dipercepat), belanja tunai selesai |
| Siti Aminah | `ANG002` | `Anggota123!` | Aktif | Pinjaman **Aktif** + 1 angsuran menunggu persetujuan, tagihan kredit belum lunas |
| Rudi Hartono | `ANG003` | `Anggota123!` | Aktif | Serba "baru diajukan" — pinjaman, simpanan berjangka, titipan produk (sudah disetujui) |
| Dewi Lestari | `ANG004` | `Anggota123!` | **Menunggu persetujuan** | Untuk tes alur approve/reject pendaftaran anggota baru |
| Agus Wijaya | `ANG005` | `Anggota123!` | Aktif | Deposito **sudah dicairkan** (contoh jatuh tempo), titipan produk pending, tagihan kredit belum lunas |

Login ke aplikasi anggota (Flutter/web member) pakai NIK+password di atas. Login admin console tetap
pakai akun ASD Anda.

---

## 2. Menu Manajemen Anggota → tab Pendaftaran

**Data siap:** Dewi Lestari (`ANG004`) berstatus **Menunggu Persetujuan** — sengaja belum disentuh.

1. Cari "Dewi Lestari" di tabel → klik **Setujui** → cek Simpanan Pokok Rp 100.000 otomatis masuk.
2. Kalau mau lihat alur tolak, daftarkan 1 akun baru sendiri lewat aplikasi anggota, lalu klik **Tolak**.

---

## 3. Menu Simpan Pinjam → tab Simpanan

**Data siap:**

| Anggota | Simpanan Wajib (periode berjalan) | Simpanan Sukarela | Simpanan Berjangka |
|---|---|---|---|
| Budi | **Dibayar** (sudah disetujui) | Rp 500.000, **Disetujui** | — |
| Siti | **Ditagih** (menunggu) | Rp 300.000, **menunggu persetujuan** | — |
| Rudi | **Ditagih** (menunggu) | Rp 200.000, **menunggu persetujuan** | Deposito 3 Bulan Rp 1.000.000, **menunggu persetujuan** |
| Agus | **Ditagih** (menunggu) | — (baru terisi setelah pencairan di bawah) | Deposito 3 Bulan Rp 1.000.000, **sudah Dicairkan** (contoh selesai) |
| ASD (akun Anda) | **Ditagih** (menunggu) | — | — |

**Yang bisa Anda test:**
1. **Konfigurasi simpanan** — ubah nominal Pokok/Wajib/bunga/PPh, lihat berubah di panel lain.
2. **Simpanan Wajib** — approve tagihan Siti/Rudi/Agus satu-satu, atau **"Setujui semua periode ini"**.
3. **Simpanan Sukarela** — setujui/tolak setoran Siti & Rudi, cek saldo bertambah setelah disetujui.
4. **Simpanan Berjangka**:
   - Setujui/tolak pengajuan Rudi (masih `Diajukan`).
   - Deposito Agus sudah **Dicairkan**: pokok Rp 1.000.000 + bunga neto Rp 9.000 (bruto Rp 11.250, PPh Rp 2.250) masuk ke Simpanan Sukarela Agus — cek kolom PPh/Neto di baris ini vs baris Rudi yang masih estimasi.
   - Coba buat 1 produk berjangka baru sendiri lewat panel "Paket Simpanan Berjangka".
5. **Hitung bunga bulan lalu** — karena semua setoran sukarela baru terjadi bulan ini, bulan lalu saldonya masih 0 sehingga bunganya 0. Untuk melihat hasil nyata, mundurkan tanggal mutasi setoran Budi ke bulan lalu dulu (contoh sebelumnya di dokumen ini masih relevan sebagai referensi cara kerja):
   ```sql
   UPDATE MutasiSimpanan SET TanggalTransaksi = '2026-08-01'
   WHERE Id = (SELECT TOP 1 m.Id FROM MutasiSimpanan m
     JOIN Simpanan s ON s.Id = m.SimpananId JOIN Pengguna p ON p.Id = s.PenggunaId
     WHERE p.NomorIndukKaryawan = 'ANG001' AND m.Jenis = 'Setor' AND m.Nominal = 500000);
   ```
   Lalu klik **"Hitung bunga bulan lalu"** di admin console.

---

## 4. Menu Simpan Pinjam → tab Pinjaman

**Data siap:**

| Anggota | Pinjaman | Status | Catatan |
|---|---|---|---|
| Budi | Rp 3.000.000, 12 bulan | **Lunas** | Dilunasi dipercepat (tanpa bunga sisa) — contoh riwayat selesai |
| Siti | Rp 5.000.000, 12 bulan | **Aktif** | Ada **1 pengajuan angsuran menunggu persetujuan** |
| Rudi | Rp 2.000.000, 24 bulan | — | **Pengajuan pinjaman baru, menunggu persetujuan** |

**Yang bisa Anda test:**
1. Tab **Pengajuan** → pengajuan Rudi → **Setujui** (jadi pinjaman aktif + jadwal angsuran) atau **Tolak**.
2. Tab **Pembayaran** → pengajuan angsuran Siti → **Setujui** → cek sisa pokok & progres berkurang, jurnal otomatis muncul.
3. Detail riwayat pinjaman Budi → expand angsuran → 12 baris "Dibatalkan" + 1 baris "Pelunasan".
4. Coba ajukan pinjaman baru sendiri lewat akun Siti/Rudi/Agus (login member).

---

## 5. Menu Manajemen Anggota → tab Katalog & Kredit

**Data siap:**
- **Stok koperasi**: Beras, Minyak Goreng, Gula Pasir masih tersedia (sisa stok berkurang dari transaksi di bawah).
- **Titipan produk**:
  - "Madu Hutan Asli" (diajukan Agus) — **menunggu persetujuan**.
  - "Telur Ayam Kampung" (diajukan Rudi) — **sudah disetujui**, aktif dijual.
- **Transaksi pembelian** (semua sudah diputuskan pengurus):
  - Agus beli Beras 2 paket, Tunai — **Selesai**.
  - Agus beli Minyak 3 botol, Kredit — **Disetujui**, tagihan kredit **Belum lunas** (Rp 109.500).
  - Siti beli Gula 2 paket, Kredit — **Disetujui**, tagihan kredit **Belum lunas** (Rp 34.000).
  - Budi beli Telur Ayam Kampung 1 kg, Tunai — **Selesai**.

**Yang bisa Anda test:**
1. **Persetujuan titipan** — setujui/tolak "Madu Hutan Asli" milik Agus.
2. **Tagihan Kredit** — buka panel Tagihan Kredit, lihat 2 tagihan (Siti & Agus): coba **"Tandai Lunas"** langsung (alur disederhanakan — tidak ada lagi status perantara "Dikirim ke SDM", cukup Belum → Lunas).

---

## 6. Menu Manajemen Anggota → tab Payroll

Terbentuk otomatis dari Simpanan Wajib **belum disetujui** + Tagihan Kredit **belum lunas** + cicilan
pinjaman jatuh tempo bulan ini, pada periode berjalan.

1. Klik **Muat rekap periode ini** → lihat baris Budi (potongan wajib) dan Siti/Agus (tagihan kredit, kalau belum ditandai lunas).
2. Klik **"Setujui semua Simpanan Wajib periode ini"** untuk menyetujui semua tagihan wajib sekaligus.
3. Coba ekspor CSV — ini langkah terakhir alurnya: approve lewat sistem, lalu ekspor untuk dikirim ke bagian penggajian (di luar sistem, sebagai file).

---

## 7. Menu Akuntansi

**Neraca sudah seimbang dari nol** (selisih Rp 0) setelah reset — semua akun berasal dari transaksi
dummy yang baru dibuat lewat API.

1. Tab **Jurnal Umum** — termasuk 1 jurnal manual: "Pembayaran listrik kantor bulan berjalan" (Rp 250.000).
2. Tab **Bagan Akun** — 20 akun standar (termasuk 2 akun baru untuk SHU: Utang Jasa Pengurus & Cadangan Koperasi).
3. Tab **Neraca** — cek Aset vs Liabilitas+Ekuitas, harus balance.
4. Tab **Laba Rugi** — cek Pendapatan Jasa Pinjaman & Penjualan Produk vs Beban.
5. Tab **Arus Kas** — mutasi kas masuk/keluar.
6. Tab **SHU** — lihat langkah 8 di bawah.

---

## 8. Menu Akuntansi → tab SHU (kebijakan RAT, 2 lapis)

**Sengaja belum difinalisasi** supaya Anda bisa coba seluruh alurnya dari awal, dengan skema **dua lapis**
sesuai dokumen RAT:
- **Lapis 1** (dari Total SHU, wajib 100%): **Anggota 40% / Pengurus 20% / Cadangan 40%** (ditahan permanen).
- **Lapis 2** (dari pool Anggota di Lapis 1, wajib 100%): **Jasa Modal (JMA) 30% / Jasa Usaha (JUA) 70%**.

**Yang bisa Anda test:**
1. Isi form: Tahun berjalan, Total SHU (bebas, misal `2000000`). Persentase sudah default sesuai di atas, ditampilkan dalam 2 kotak terpisah (Lapis 1 dan Lapis 2) dengan sekat visual.
2. Klik **"Ambil dari Hasil Usaha"** untuk auto-isi dari laba bersih tahun berjalan.
3. Klik **Hitung (pratinjau)** — lihat 4 kartu: Cadangan, Jasa Pengurus, Total ke anggota (neto), PPh anggota — plus rincian per anggota (Budi & Siti dapat bagian lebih besar karena riwayat pinjaman/belanja).
4. Klik **Finalisasi** — jurnal apropriasi otomatis dibuat, memecah SHU ke 4 akun (Cadangan Koperasi, Utang Jasa Pengurus, Utang SHU Anggota, Utang PPh).
5. Login sebagai Budi di aplikasi anggota → Beranda → "Estimasi SHU" → halaman **SHU Saya**.
6. Cek **Riwayat SHU** (kolom baru: Cadangan, Jasa Pengurus) & ekspor CSV.

---

## 9. Menu E-RAT & Dokumen (tab "Laporan RAT Otomatis")

Fitur baru: laporan RAT bisa **ditayangkan langsung ke aplikasi anggota** dari data sistem, tanpa upload PDF manual.

1. Buka tab **Laporan RAT (Otomatis)**, pilih tahun buku berjalan, mode "Edit konten & RAB" — isi Kegiatan Bisnis/Sosial, Rencana tahun depan, Realisasi Pajak SHU.
2. Selesaikan SHU tahun ini dulu (langkah 8 di atas) — laporan butuh SHU terfinalisasi supaya lengkap.
3. Balik ke mode "Lihat laporan" — kalau semua sudah lengkap, tombol **"Tayangkan ke Anggota"** aktif. Kalau belum, pesan merah menyebutkan persis apa yang kurang.
4. Klik tayangkan → login sebagai anggota di aplikasi Flutter → menu E-RAT → kartu **"Laporan RAT Resmi"** muncul, bisa dibuka jadi halaman detail (Visi/Misi, Keanggotaan, ringkasan Neraca/Laba-Rugi, pembagian SHU dengan bar visual).
5. Coba **"Batalkan penayangan"** untuk lihat kartu itu hilang lagi dari aplikasi anggota.
6. Coba **Cetak / Simpan PDF** — sekarang fokus ke isi laporan saja (portrait, tabel dirapikan, tanpa navigasi ikut ter-print).

---

## 10. Audit Trail — cara kerjanya

Ada **dua lapisan**, ditampilkan sebagai 2 tab di menu **Audit Trail** (khusus Admin):

### Tab "Aktivitas aplikasi"
Dicatat otomatis setiap ada persetujuan/perubahan data sensitif lewat admin console. Sudah ada banyak
baris baru dari proses seeding di atas — coba filter per modul dan cari nama anggota.

### Tab "Log database (mentah)"
Dicatat langsung oleh trigger SQL Server — mencatat perubahan apa pun jalurnya, termasuk edit langsung
lewat SSMS/dBeaver. Contoh nyata: waktu menyiapkan ulang data dummy kali ini, saya sengaja mempercepat
simulasi "jatuh tempo" deposito Agus dengan **mengedit langsung lewat SQL** (bukan lewat API).

1. Buka tab **Log database (mentah)**, filter tabel `SimpananBerjangka`, cari baris untuk deposito Agus.
2. Baris pengajuan & persetujuan tercatat **Aplikasi = `EFCore/...`** (lewat API), tapi baris perubahan status ke `JatuhTempo` tercatat **Aplikasi = `SQLCMD`** — bukti perubahan manual tetap tertangkap.
3. Klik tombol **"Verifikasi integritas"** — harus melaporkan **"Rantai hash audit database utuh"**.

> Catatan produksi: di lingkungan development ini, koneksi aplikasi dan koneksi SQL manual pakai akun
> Windows yang sama, jadi `DbLogin` keduanya sama. Di produksi, aplikasi harus pakai login SQL khusus
> yang berbeda dari kredensial siapa pun yang mengakses database manual (detail di `backend/db-hardening.sql`).

---

## 11. Membersihkan & membuat ulang data dummy

Kalau nanti ingin mulai dari nol lagi, minta saya (Claude) jalankan lagi — prosesnya:
1. Hapus semua akun `ANG%` beserta transaksinya + reset seluruh jurnal & SHU run lewat SQL (dengan konfirmasi Anda dulu, karena ini operasi hapus massal).
2. Buat ulang data lewat API asli (register → approve → simpanan → pinjaman → katalog → jurnal manual) memakai token admin sementara yang Anda berikan, supaya jurnal & audit trail tetap konsisten.

Profil koperasi, konten RAT (Visi/Misi/narasi), bagan akun, dan konfigurasi koperasi TIDAK ikut
dihapus dalam proses reset — hanya data transaksi anggota dummy.
