# Deployment Guide — Admin Console & Backend ke IIS On-Premise

Panduan ini untuk deploy **Backend (ASP.NET Core Minimal API)** dan **Admin Console (React/Vite)** ke server IIS kantor, dengan database SQL Server on-premise.

> Aplikasi mobile anggota (folder `apk/`) TIDAK dibahas di sini — itu di-build & didistribusikan terpisah (APK/App Store), bukan di-hosting di IIS.

---

## 0. Ringkasan Environment

| Komponen | Detail |
|---|---|
| Server | Windows Server dengan IIS |
| Database | SQL Server on-premise, instance `WIN-0UDHQPRP2VK\GCS`, port `49291` |
| Backend | ASP.NET Core (.NET 10) — di-hosting via ASP.NET Core Module (ANCM) di IIS |
| Admin Console | Static SPA hasil build Vite — disajikan IIS sebagai situs statis biasa (tidak perlu URL Rewrite/SPA fallback karena navigasi memakai state React, bukan React Router) |

---

## 1. Prasyarat di Server IIS

1. **IIS Role** aktif (Server Manager → Add Roles and Features → Web Server (IIS)).
2. **.NET 10 Hosting Bundle** (ASP.NET Core Runtime + IIS Module) — unduh dari halaman resmi `dotnet.microsoft.com/download/dotnet/10.0`, pilih installer **"Hosting Bundle"** (bukan hanya SDK/Runtime biasa). Setelah instal, **restart IIS** (`iisreset` di Command Prompt Administrator) agar module `AspNetCoreModuleV2` terdaftar.
3. Pastikan **SQL Server Browser** service menyala jika memakai named instance (`\GCS`) tanpa port eksplisit; karena port `49291` sudah diketahui statis, ini opsional — cukup pastikan **TCP/IP protocol** aktif di SQL Server Configuration Manager dan firewall server mengizinkan port `49291` (dan port IIS site nantinya, misal `80`/`8080`).
4. Buat 2 folder tujuan deploy, misalnya:
   - `C:\inetpub\kkcs-backend` — untuk backend
   - `C:\inetpub\kkcs-admin` — untuk admin console

---

## 2. Siapkan Database

Database `db-kkcs` belum dibuat — tidak masalah, EF Core migrations akan membuatnya otomatis selama akun `sa` punya hak `CREATE DATABASE` (defaultnya iya).

### Opsi A — Jalankan migrasi langsung dari komputer development (paling cepat)

Kalau komputer development ini satu jaringan dengan server SQL kantor (biasanya iya untuk on-prem), jalankan dari folder `backend/`:

```bash
dotnet tool install --global dotnet-ef   # sekali saja kalau belum ada
dotnet ef database update --connection "Server=WIN-0UDHQPRP2VK\GCS,49291;Database=db-kkcs;User Id=sa;Password=<DB_PASSWORD>;TrustServerCertificate=True;MultipleActiveResultSets=True"
```

Ganti `<DB_PASSWORD>` dengan password `sa` yang sebenarnya. Perintah ini akan membuat database `db-kkcs` (kalau belum ada) sekaligus menjalankan seluruh migrasi yang ada.

### Opsi B — Generate SQL script, jalankan lewat SSMS (kalau tidak mau expose akses langsung dari komputer dev)

```bash
dotnet ef migrations script --idempotent -o migrate.sql
```

Lalu buka `migrate.sql` di SQL Server Management Studio (SSMS) yang terhubung ke `WIN-0UDHQPRP2VK\GCS,49291`, jalankan terhadap database `db-kkcs` (buat database kosong dulu manual kalau pakai cara ini).

---

## 3. Deploy Backend

### 3.1 Buat `appsettings.Production.json` (JANGAN dikomit ke git)

File ini sengaja **tidak** dibuat lewat Claude/di-commit ke repo — sudah ditambahkan ke `backend/.gitignore` supaya connection string & secret asli tidak pernah masuk git history. Buat manual di folder `backend/` sebelum publish, isinya:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=WIN-0UDHQPRP2VK\\GCS,49291;Database=db-kkcs;User Id=sa;Password=<DB_PASSWORD>;TrustServerCertificate=True;MultipleActiveResultSets=True"
  },
  "Jwt": {
    "Key": "<GANTI-DENGAN-KUNCI-RAHASIA-BARU-MINIMAL-32-KARAKTER>",
    "Issuer": "KKCS.Api",
    "Audience": "KKCS.App",
    "ExpiresInMinutes": 120
  }
}
```

Catatan penting:
- **Wajib ganti `Jwt:Key`** dengan string acak baru (jangan pakai nilai development `kkcs-development-secret-key-change-in-production-2026` yang ada di `appsettings.json`) — kunci ini menandatangani token login, kalau bocor/sama dengan repo publik, siapa pun bisa memalsukan token.
- Backslash pada nama instance SQL (`\GCS`) harus ditulis `\\` di dalam JSON.
- `TrustServerCertificate=True` dipakai karena SQL Server on-prem biasanya belum punya certificate resmi — cukup aman untuk trafik dalam jaringan kantor sendiri.

### 3.2 Publish dari komputer development

Dari folder `backend/`:

```bash
dotnet publish -c Release -o ./publish
```

Lalu **salin `appsettings.Production.json` yang sudah dibuat di langkah 3.1 ke dalam folder `./publish`** (menimpa/melengkapi `appsettings.json` bawaan — ASP.NET Core otomatis memakai `appsettings.Production.json` saat `ASPNETCORE_ENVIRONMENT=Production`).

Periksa juga folder `./publish/wwwroot` — pastikan `logo-kkcs.png` dan folder `uploads/` ikut ter-copy (dipakai untuk logo PDF & file bukti transfer/dokumen upload).

### 3.3 Salin ke server

Salin **seluruh isi folder `./publish`** ke `C:\inetpub\kkcs-backend` di server (lewat network share, USB, atau remote desktop copy-paste).

### 3.4 Buat Application Pool di IIS

1. Buka **IIS Manager** → Application Pools → **Add Application Pool**.
2. Nama: `kkcs-backend`, **.NET CLR version: "No Managed Code"** (wajib — backend jalan lewat ASP.NET Core Module, bukan CLR IIS klasik), Managed pipeline mode: Integrated.
3. Klik kanan pool → Advanced Settings → pastikan **Identity** punya akses baca/tulis ke folder `C:\inetpub\kkcs-backend` (default `ApplicationPoolIdentity` biasanya cukup, tapi folder `wwwroot\uploads` perlu izin **Write** — lihat langkah 3.6).

### 3.5 Buat Site/Application di IIS

1. Klik kanan **Sites** → **Add Website**.
2. Site name: `KKCS Backend`, Physical path: `C:\inetpub\kkcs-backend`, Application pool: pilih `kkcs-backend` yang dibuat tadi.
3. Binding: pilih port yang tidak bentrok, misalnya `http`, port `5168` atau `8081` (samakan nanti dengan `VITE_API_BASE_URL` di langkah admin console).
4. **Set environment variable `ASPNETCORE_ENVIRONMENT=Production`**: klik site → **Configuration Editor** → section `system.webServer/aspNetCore` → buka `environmentVariables` → tambah `ASPNETCORE_ENVIRONMENT` = `Production`. (Atau edit `web.config` hasil publish langsung, ada elemen `<environmentVariables>` di dalam `<aspNetCore>`.)

### 3.6 Permission folder upload

Backend menyimpan file upload (bukti transfer, dokumen RAT, foto profil, dll) ke `wwwroot/uploads`. Beri **Modify/Write** permission untuk folder `C:\inetpub\kkcs-backend\wwwroot\uploads` ke user `IIS AppPool\kkcs-backend` (klik kanan folder → Properties → Security → Edit → Add → ketik `IIS AppPool\kkcs-backend` → centang Modify).

### 3.7 Test

Buka browser di server (atau komputer lain di jaringan yang sama) ke `http://<IP-atau-hostname-server>:<port>/api/auth/me` — harus dapat response `401 Unauthorized` (bukan error koneksi/500), itu tandanya backend sudah hidup dan bisa dihubungi.

---

## 4. Deploy Admin Console

### 4.1 Set API base URL untuk production

Di folder `admin/`, buat file `.env.production`:

```
VITE_API_BASE_URL=http://<IP-atau-hostname-server>:<port-backend>
```

Isi dengan alamat backend yang sudah di-deploy di langkah 3 (harus bisa diakses dari komputer-komputer yang akan pakai admin console).

### 4.2 Build

```bash
cd admin
npm install
npm run build
```

Hasil build ada di folder `admin/dist`.

### 4.3 Salin ke server & buat site IIS

1. Salin seluruh isi `admin/dist` ke `C:\inetpub\kkcs-admin` di server.
2. IIS Manager → **Add Website** → Site name: `KKCS Admin`, Physical path: `C:\inetpub\kkcs-admin`, Application pool: buat pool baru **"No Managed Code"** juga (situs statis tidak butuh ASP.NET, tapi pool terpisah tetap disarankan agar tidak tercampur dengan pool backend) atau pakai `DefaultAppPool`.
3. Binding: port berbeda dari backend, misal `80` atau `8080`.
4. Buka `http://<IP-server>:<port-admin>` dari browser — halaman login Admin Console harus muncul, dan saat login harus berhasil memanggil backend di port yang diset di `.env.production`.

> Tidak perlu URL Rewrite/SPA fallback — Admin Console ini satu halaman (`index.html`) dengan navigasi berbasis state React (`view === 'dashboard' | 'anggota' | ...`), bukan React Router dengan banyak path URL, jadi tidak ada masalah refresh-404 seperti SPA berbasis routing biasa.

---

## 5. Checklist Setelah Deploy

- [ ] Login admin/pengurus dari Admin Console berhasil (token JWT diterima)
- [ ] Coba satu fitur upload file (misal ajukan Simpanan Sukarela dari app mobile atau cek panel bukti transfer) — pastikan folder `wwwroot/uploads` bisa ditulisi
- [ ] Coba unduh salah satu PDF (Laporan Anggota / Manual Book Pengurus) — pastikan logo KKCS muncul (butuh `wwwroot/logo-kkcs.png` ikut ter-publish)
- [ ] Cek `dotnet ef database update` sudah menjalankan SEMUA migrasi (jumlah tabel di `db-kkcs` sesuai jumlah model — kalau ragu, bandingkan dengan database development)
- [ ] Ganti `Jwt:Key` di `appsettings.Production.json` sudah dilakukan (bukan nilai default development)
- [ ] Folder `appsettings.Production.json` di server TIDAK ikut ter-commit ke git (sudah dijamin lewat `backend/.gitignore`, tapi cek ulang kalau publish dilakukan dari clone repo yang berbeda)

## 6. Untuk Nanti (Tidak Wajib Sekarang)

- **Sertifikat HTTPS**: saat ini panduan pakai HTTP biasa (asumsi trafik dalam LAN kantor). Kalau nanti admin console diakses dari luar jaringan kantor, pasang certificate (self-signed internal CA atau certificate resmi) di binding IIS dan aktifkan HTTPS di kedua site.
- **Aplikasi mobile**: `apk/lib/main.dart` (fungsi `AuthService.baseUrl`) saat ini hardcode ke `localhost`/`10.0.2.2` untuk development — sebelum build APK produksi untuk anggota, alamat ini perlu diarahkan ke alamat backend production juga (idealnya lewat build-time config seperti `--dart-define`, bukan hardcode langsung).
- Backend punya 1 warning kerentanan minor (`Microsoft.OpenApi` 2.0.0) dari `dotnet build` — tidak menghalangi deployment, tapi baik untuk di-update NuGet package-nya lain waktu.
