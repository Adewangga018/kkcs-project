# Panduan Testing Mandiri — Admin Console KKCS

Dokumen ini berisi data dummy yang sudah disiapkan di database (bukan mock — data nyata lewat API,
supaya jurnal akuntansi & audit trail-nya ikut konsisten) beserta langkah-langkah testing per menu.

- **Admin console**: http://localhost:5173
- **Backend API**: http://localhost:5168
- **Login Anda (ASD)**: tetap sebagai Admin, pakai kredensial Anda sendiri seperti biasa.

> Kalau backend belum jalan, jalankan `dotnet run` di folder `backend/`. Admin console (`npm run dev`
> di folder `admin/`) sudah jalan di background.

---

## 1. Akun dummy anggota

Semua pakai password yang sama supaya gampang diingat.

| Nama | NIK | Password | Status | Peran skenario |
|---|---|---|---|---|
| Budi Santoso | `ANG001` | `Anggota123!` | Aktif | Anggota "lengkap" — riwayat simpanan, pinjaman lunas, belanja selesai |
| Siti Aminah | `ANG002` | `Anggota123!` | Aktif | Pinjaman aktif berjalan + ada pengajuan menunggu persetujuan |
| Rudi Hartono | `ANG003` | `Anggota123!` | Aktif | Serba "baru diajukan" — pinjaman, berjangka, titipan produk |
| Dewi Lestari | `ANG004` | `Anggota123!` | **Menunggu persetujuan** | Untuk tes alur approve/reject pendaftaran anggota baru |
| Agus Wijaya | `ANG005` | `Anggota123!` | Aktif | Katalog & kredit — titipan produk, beli tunai, beli kredit |

Anda bisa login ke aplikasi anggota (Flutter/web member) pakai NIK+password di atas kalau mau melihat
sisi anggotanya juga. Login admin console tetap pakai akun ASD Anda.

---

## 2. Menu Pendaftaran

**Data siap:** Dewi Lestari (`ANG004`) berstatus **Menunggu Persetujuan** — sengaja belum disentuh.

**Yang bisa Anda test:**
1. Buka menu **Pendaftaran** → cari "Dewi Lestari" di tabel.
2. Klik **Setujui** → cek Simpanan Pokok Rp 100.000 otomatis masuk (lihat di menu Simpanan / Direktori Anggota).
3. Kalau mau lihat alur tolak, daftarkan 1 akun baru sendiri lewat aplikasi anggota dulu, lalu klik **Tolak** di sini.

---

## 3. Menu Simpanan

**Data siap:**

| Anggota | Simpanan Wajib (periode 2026-09) | Simpanan Sukarela | Simpanan Berjangka |
|---|---|---|---|
| Budi | **Dibayar** (sudah disetujui) | Rp 500.000, **Disetujui** | — |
| Siti | **Ditagih** (menunggu) | Rp 300.000, **menunggu persetujuan** | — |
| Rudi | **Ditagih** (menunggu) | Rp 200.000, **menunggu persetujuan** | Deposito 3 Bulan Rp 1.000.000, **menunggu persetujuan** |
| Agus | **Ditagih** (menunggu) | — | Deposito 3 Bulan Rp 1.000.000, **status JatuhTempo** (siap dicairkan) |
| ASD (akun Anda) | **Ditagih** (menunggu) | — | — |

> Catatan: tagihan Simpanan Wajib periode berjalan otomatis dibuat untuk **semua** anggota aktif
> (termasuk akun ASD Anda sendiri) — itu bukan bug, itu cara kerja normal fitur "Buat tagihan bulan ini".

**Yang bisa Anda test:**
1. **Konfigurasi simpanan** — ubah nominal Pokok/Wajib/bunga/PPh, simpan, lihat berubah di panel lain.
2. **Simpanan Wajib** — approve tagihan Siti/Rudi/Agus satu-satu, atau pakai tombol **"Setujui semua periode ini"** untuk uji approval massal. Tagihan Budi biarkan saja (sudah lunas, buat pembanding).
3. **Simpanan Sukarela** — setujui/tolak setoran Siti & Rudi. Setelah disetujui, cek saldo sukarela mereka bertambah.
4. **Simpanan Berjangka**:
   - Setujui/tolak pengajuan Rudi (masih `Diajukan`).
   - Berjangka Agus statusnya **JatuhTempo** → klik **Cairkan**. Perhatikan pesan hasil: pokok + bunga **neto** (sudah dipotong PPh) masuk ke saldo Sukarela Agus. Ini contoh langsung fitur PPh yang baru kita aktifkan untuk bunga deposito.
   - Coba buat 1 produk berjangka baru sendiri lewat panel "Paket Simpanan Berjangka" untuk lihat form-nya.

---

## 4. Menu Pinjaman

**Data siap:**

| Anggota | Pinjaman | Status | Catatan |
|---|---|---|---|
| Budi | Rp 3.000.000, 12 bulan | **Lunas** | Dilunasi dipercepat (tanpa bunga sisa) — contoh riwayat selesai |
| Siti | Rp 5.000.000, 12 bulan | **Aktif** | Ada **1 pengajuan angsuran menunggu persetujuan** |
| Rudi | Rp 2.000.000, 24 bulan | — | **Pengajuan pinjaman baru, menunggu persetujuan** (belum jadi pinjaman aktif) |

**Yang bisa Anda test:**
1. Buka tab **Pengajuan** → lihat pengajuan Rudi → klik **Setujui** (jadi pinjaman aktif + jadwal angsuran otomatis dibuat) atau **Tolak** untuk lihat alur penolakan.
2. Buka tab **Pembayaran** → lihat pengajuan angsuran Siti → **Setujui** → cek sisa pokok & progres angsuran Siti berkurang, dan munculnya jurnal otomatis di menu Akuntansi.
3. Lihat detail riwayat pinjaman Budi (klik baris pinjamannya) → expand angsuran → lihat 12 baris "Dibatalkan" + 1 baris "Pelunasan" — ini bukti fitur pelunasan dipercepat tanpa bunga sisa.
4. Coba ajukan pinjaman baru sendiri lewat akun Siti/Rudi/Agus (login member) kalau mau lihat sisi form pengajuan anggota.

---

## 5. Menu Katalog

**Data siap:**

- **Stok koperasi** sudah ditambah: Beras 50 paket, Minyak Goreng 80 botol, Gula Pasir 100 paket (tadinya 0, jadi pembelian bisa diuji).
- **Titipan produk**:
  - "Madu Hutan Asli" (diajukan Agus) — **menunggu persetujuan**.
  - "Telur Ayam Kampung" (diajukan Rudi) — **sudah disetujui**, aktif dijual.
- **Transaksi pembelian**:
  - Agus beli Beras 2 paket, **Tunai** — **menunggu persetujuan**.
  - Agus beli Minyak 3 botol, **Kredit** — **menunggu persetujuan**.
  - Siti beli Gula 2 paket, **Kredit** — **sudah disetujui**, tagihan kredit **Belum lunas** (Rp 34.000).
  - Budi beli Telur Ayam Kampung 1 kg, **Tunai** — **Selesai** (riwayat lengkap).

**Yang bisa Anda test:**
1. **Persetujuan titipan** — setujui/tolak "Madu Hutan Asli" milik Agus. Kalau disetujui, boleh langsung coba belanja produk itu sendiri (misal login sebagai anggota lain, atau ajukan lewat endpoint).
2. **Pembelian Tunai** — setujui pembelian Beras milik Agus → status langsung `Selesai`, stok Beras berkurang, jurnal Kas bertambah otomatis.
3. **Pembelian Kredit (titipan koperasi)** — setujui pembelian Minyak (Kredit) milik Agus → status `Disetujui`, dan **Tagihan Kredit baru muncul** (`Belum` lunas) — ini yang jadi bahan Menu Payroll.
4. **Tagihan Kredit** — buka panel Tagihan Kredit, lihat 2 tagihan (Siti & Agus setelah langkah 3): coba tombol **"Kirim ke SDM"** lalu **"Tandai Lunas"** untuk lihat siklus penuhnya.

---

## 6. Menu Payroll (Laporan potong gaji)

Data ini otomatis terbentuk dari Simpanan Wajib yang **sudah disetujui** + Tagihan Kredit yang **belum lunas**
pada periode berjalan (2026-09) — tidak perlu seed terpisah.

**Yang bisa Anda test:**
1. Buka menu **Payroll**, klik **Muat rekap periode ini**.
2. Anda akan melihat baris Budi (potongan Simpanan Wajib Rp 50.000) dan Siti (potongan Tagihan Kredit Rp 34.000, kalau belum ditandai lunas di langkah Katalog di atas).
3. Setujui lebih banyak tagihan wajib di menu Simpanan (Rudi/Agus) lalu muat ulang rekap — baris baru akan muncul.
4. Coba tombol ekspor CSV untuk lihat format rekap yang dikirim ke bagian SDM/payroll.

---

## 7. Menu Akuntansi

Setiap transaksi yang Anda setujui di atas (simpanan, pinjaman, pembelian) **otomatis membuat jurnal**
lewat sistem — tidak ada langkah manual yang perlu disiapkan lagi, sudah ada ~13 jurnal otomatis dari seeding.

**Yang bisa Anda test:**
1. Tab **Jurnal Umum** — lihat daftar jurnal, termasuk 1 contoh **jurnal manual**: "Pembayaran listrik kantor bulan September" (Rp 250.000, Debit Beban Operasional Lain / Kredit Kas) — dicatat oleh "Sistem Seed Data".
2. Coba **tambah jurnal manual** sendiri (misal transaksi non-sistem lain) lewat form di bagian bawah tab ini.
3. Tab **Bagan Akun** — lihat daftar akun standar, coba tambah 1 akun baru custom.
4. Tab **Neraca** — pilih tanggal hari ini, cek Aset (Kas + Piutang Pinjaman) vs Liabilitas+Ekuitas (Simpanan anggota, dst.) — harus balance (selisih = 0).
5. Tab **Laba Rugi** — pilih rentang tanggal tahun ini, lihat Pendapatan Jasa Pinjaman & Penjualan Produk vs Beban.
6. Tab **Arus Kas** — lihat mutasi kas masuk/keluar dari semua transaksi yang sudah Anda proses.

---

## 8. Menu SHU

**Sengaja belum difinalisasi** supaya Anda bisa coba seluruh alurnya dari awal dengan data yang sudah realistis
(Budi & Siti sudah punya simpanan pokok+wajib dan riwayat pinjaman/belanja; Rudi & Agus juga sudah py simpanan pokok).

**Yang bisa Anda test:**
1. Isi form: Tahun `2026`, Total SHU (bebas, misal `5000000`), % Jasa Modal `30`, % Jasa Usaha `70`.
2. Klik **"Ambil dari Laba Rugi"** untuk lihat fitur auto-isi dari laba bersih tahun berjalan.
3. Klik **Hitung (pratinjau)** — lihat rincian per anggota: Simpanan, Transaksi, JMA, JUA, Total SHU Bruto, **PPh**, **Total SHU Neto**. Budi & Siti seharusnya dapat bagian lebih besar (mereka punya riwayat pinjaman/belanja).
4. Klik **Finalisasi & kirim ke aplikasi anggota** — setelah ini, coba login sebagai Budi di aplikasi anggota, buka Beranda → klik kartu "Estimasi SHU" → halaman **SHU Saya** akan menampilkan rincian lengkap tahun 2026 miliknya.
5. Cek **Riwayat SHU** & tombol **Ekspor CSV**.

---

## 9. Audit Trail — cara kerjanya

Ada **dua lapisan** yang saling melengkapi, ditampilkan sebagai 2 tab di menu **Audit Trail** (khusus Admin):

### Tab "Aktivitas aplikasi"
Dicatat otomatis oleh kode aplikasi setiap ada **persetujuan/perubahan data sensitif lewat admin console**
(persetujuan pinjaman, simpanan, katalog, ubah peran, reset akses, dll). Menjawab pertanyaan
**"siapa pengguna aplikasi yang melakukan aksi ini, lewat menu apa"**. Sudah ada 14 baris dari proses
seeding di atas — coba filter per modul (Pinjaman, Simpanan, Katalog, dst.) dan cari kata kunci nama anggota.

### Tab "Log database (mentah)"
Dicatat langsung oleh **trigger SQL Server** pada tabel-tabel finansial — ini jalan **di level database**,
jadi mencatat perubahan **apa pun jalurnya**, termasuk kalau seseorang mengedit data langsung lewat
dBeaver/SSMS tanpa lewat aplikasi sama sekali. Ini yang menjawab kekhawatiran Anda soal audit yang bisa
dilewati kalau orang akses database langsung.

**Contoh nyata yang sudah ada di data Anda** (biar tidak abstrak): waktu menyiapkan data dummy, saya sengaja
mempercepat simulasi "sudah jatuh tempo" untuk deposito Agus dengan **mengedit langsung lewat SQL**
(bukan lewat API). Coba begini:
1. Buka tab **Log database (mentah)**.
2. Filter tabel `SimpananBerjangka`, cari 3 baris untuk kunci `10` (deposito Agus).
3. Anda akan lihat baris pertama & kedua tercatat dengan **Aplikasi = `EFCore/...`** (lewat API, saat pengajuan & persetujuan), tapi baris ketiga (perubahan status ke `JatuhTempo`) tercatat dengan **Aplikasi = `SQLCMD`** — bukti langsung bahwa perubahan lewat SQL manual pun tetap tertangkap, lengkap dengan siapa (`DbLogin`) yang melakukannya.
4. Klik baris mana pun untuk lihat data sebelum/sesudah dalam format JSON, dan hash rantainya.
5. Klik tombol **"Verifikasi integritas"** — sistem menghitung ulang seluruh rantai hash dan melaporkan kalau ada baris yang diubah/dihapus diam-diam setelah tercatat. Sekarang harusnya melaporkan **"Rantai hash audit database utuh"**.

> Catatan penting yang perlu Anda tindak lanjuti (dijelaskan detail di `backend/db-hardening.sql`):
> di lingkungan development ini, koneksi aplikasi dan koneksi SQL manual saya sama-sama pakai akun
> Windows yang sama, jadi `DbLogin` keduanya sama. Di produksi nanti, aplikasi **harus** pakai login
> SQL khusus yang berbeda dari kredensial siapa pun yang mengakses database secara manual, supaya
> kolom `DbLogin` benar-benar bisa membedakan "aplikasi" dari "orang tertentu yang login manual".

---

## 10. Membersihkan data dummy (opsional, kapan pun Anda mau)

Kalau nanti ingin mulai dari nol lagi, jalankan skrip berikut lewat SQL (sqlcmd/SSMS/dBeaver) —
ini menghapus SEMUA data anggota `ANG001`–`ANG005` beserta transaksinya, tanpa menyentuh akun Anda (ASD):

```sql
DECLARE @ids TABLE (Id INT);
INSERT INTO @ids SELECT Id FROM Pengguna WHERE NomorIndukKaryawan LIKE 'ANG%';

DELETE FROM MutasiSimpanan WHERE SimpananId IN (SELECT Id FROM Simpanan WHERE PenggunaId IN (SELECT Id FROM @ids));
DELETE FROM AngsuranPinjaman WHERE PinjamanId IN (SELECT Id FROM Pinjaman WHERE PenggunaId IN (SELECT Id FROM @ids));
DELETE FROM PembayaranPinjaman WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM Pinjaman WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM PengajuanPinjaman WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM TagihanKredit WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM PembelianProduk WHERE PembeliId IN (SELECT Id FROM @ids);
DELETE FROM Produk WHERE DiajukanOlehId IN (SELECT Id FROM @ids);
DELETE FROM SimpananBerjangka WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM TransaksiSukarela WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM TagihanWajib WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM ShuAnggota WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM Simpanan WHERE PenggunaId IN (SELECT Id FROM @ids);
DELETE FROM Pengguna WHERE Id IN (SELECT Id FROM @ids);
```

Jurnal akuntansi & baris audit trail yang sudah tercatat akan tetap ada (memang begitu sifatnya — audit
trail tidak dihapus otomatis); kalau mau bersih total, hapus juga baris `JurnalEntri`/`JurnalBaris` dengan
`ReferensiId` yang menyebut id-id akun di atas, serta baris `AuditLog`/`DbAuditLog` terkait.
