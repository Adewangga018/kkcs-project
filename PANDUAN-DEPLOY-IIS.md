# Panduan Deploy ke IIS — Langkah Demi Langkah

Panduan ini khusus membahas **konfigurasi di sisi IIS/Windows Server** secara pelan-pelan, klik demi klik. Untuk langkah publish/build (`dotnet publish`, `npm run build`) dan isi `appsettings.Production.json`, lihat [`README.md`](README.md) — panduan ini melanjutkan dari titik "file hasil publish sudah ada di tangan Anda".

Ikuti urutan dari atas ke bawah. Jangan lompat — banyak error IIS terjadi karena satu langkah kecil terlewat (misalnya lupa restart IIS setelah install Hosting Bundle).

---

## Bagian 1 — Instal IIS Role

1. Buka **Server Manager** (biasanya otomatis terbuka saat login, atau cari di Start Menu).
2. Klik **Manage** (kanan atas) → **Add Roles and Features**.
3. Klik **Next** terus sampai halaman **Server Roles**.
4. Centang **Web Server (IIS)**. Akan muncul popup "Add features that are required for Web Server (IIS)?" → klik **Add Features**.
5. Klik **Next** sampai halaman **Role Services**. Pastikan tercentang minimal:
   - **Common HTTP Features** → Default Document, Static Content
   - **Health and Diagnostics** → HTTP Logging
   - **Performance** → Static Content Compression
   - **Security** → Request Filtering
   - **Management Tools** → IIS Management Console
6. Klik **Next** → **Install**. Tunggu sampai selesai, lalu **Close**.
7. Cek berhasil: buka browser di server itu sendiri, akses `http://localhost` — harus muncul halaman default IIS ("IIS Windows Server" dengan logo biru).

---

## Bagian 2 — Instal .NET 10 Hosting Bundle

Ini komponen yang membuat IIS bisa menjalankan aplikasi ASP.NET Core (backend kita). Tanpa ini, IIS hanya bisa menyajikan file statis (HTML/CSS/JS) — cocok untuk Admin Console, tapi TIDAK cukup untuk backend.

1. Di server, buka browser, kunjungi halaman resmi unduhan .NET (`dotnet.microsoft.com/download/dotnet/10.0`).
2. Cari bagian **"Hosting Bundle"** di kolom ASP.NET Core Runtime — bukan "SDK", bukan ".NET Runtime" biasa. Unduh installer `dotnet-hosting-10.x.x-win.exe`.
3. Jalankan installer sebagai **Administrator** (klik kanan → Run as administrator). Ikuti wizard, klik Next/Install sampai selesai.
4. **Wajib restart IIS** setelah instalasi, supaya module `AspNetCoreModuleV2` terdaftar ke IIS:
   ```
   iisreset
   ```
   Jalankan perintah ini di **Command Prompt (Administrator)**.
5. Cek berhasil: buka **IIS Manager** → klik nama server (paling atas di panel kiri) → double-click **Modules** di panel tengah → cari `AspNetCoreModuleV2` di daftar. Kalau muncul, instalasi berhasil.

---

## Bagian 3 — Pastikan SQL Server Bisa Diakses dari Jaringan

Server IIS perlu bisa "menjangkau" SQL Server `WIN-0UDHQPRP2VK\GCS` di port `49291`. Ini biasanya sudah jalan (karena skenarionya satu jaringan kantor), tapi kalau nanti error koneksi database, cek 3 hal ini:

1. **TCP/IP aktif** — buka **SQL Server Configuration Manager** di komputer yang menjalankan SQL Server → **SQL Server Network Configuration** → **Protocols for GCS** → pastikan **TCP/IP** berstatus **Enabled**. Kalau baru diaktifkan, restart service SQL Server (`SQL Server (GCS)`) lewat tab **SQL Server Services**.
2. **Port 49291 tidak diblokir firewall** — di komputer SQL Server, buka **Windows Defender Firewall with Advanced Security** → **Inbound Rules** → **New Rule** → Port → TCP → Specific local ports: `49291` → Allow the connection → centang semua profile (Domain/Private/Public) → beri nama misalnya "SQL Server GCS 49291".
3. **Test dari server IIS** — di server IIS, buka Command Prompt, jalankan:
   ```
   Test-NetConnection -ComputerName WIN-0UDHQPRP2VK -Port 49291
   ```
   (perintah PowerShell — buka **PowerShell**, bukan cmd biasa). Kalau `TcpTestSucceeded : True`, jaringan sudah beres.

---

## Bagian 4 — Siapkan Folder & Salin File Hasil Publish

1. Di server IIS, buat 2 folder:
   ```
   C:\inetpub\kkcs-backend
   C:\inetpub\kkcs-admin
   ```
2. Salin **seluruh isi** folder `backend/publish` (hasil `dotnet publish`, lihat README.md bagian 3.2) ke `C:\inetpub\kkcs-backend`. Pastikan file `appsettings.Production.json` (dengan connection string & JWT key asli) ikut ada di situ.
3. Salin **seluruh isi** folder `admin/dist` (hasil `npm run build`, lihat README.md bagian 4.2) ke `C:\inetpub\kkcs-admin`.

---

## Bagian 5 — Buat Application Pool untuk Backend

1. Buka **IIS Manager**.
2. Di panel kiri, klik kanan **Application Pools** → **Add Application Pool...**
3. Isi:
   - **Name**: `kkcs-backend`
   - **.NET CLR version**: pilih **No Managed Code** (PENTING — ASP.NET Core tidak pakai CLR IIS klasik, kalau salah pilih versi .NET Framework, backend tidak akan jalan)
   - **Managed pipeline mode**: `Integrated` (default, biarkan saja)
4. Klik **OK**.
5. Klik kanan pool `kkcs-backend` yang baru dibuat → **Advanced Settings**.
6. Cari **Process Model → Identity** — biarkan default `ApplicationPoolIdentity` (identitas khusus otomatis dibuatkan Windows bernama `IIS AppPool\kkcs-backend`, ini yang nanti dipakai untuk atur permission folder di Bagian 8).
7. Klik **OK**.

---

## Bagian 6 — Buat Website Backend di IIS

1. Di panel kiri IIS Manager, klik kanan **Sites** → **Add Website...**
2. Isi:
   - **Site name**: `KKCS Backend`
   - **Application pool**: klik **Select...** → pilih `kkcs-backend` → OK
   - **Physical path**: klik tombol `...` → arahkan ke `C:\inetpub\kkcs-backend`
   - **Binding**: Type `http`, IP address `All Unassigned`, Port `8081` (atau port lain yang belum dipakai — hindari `80` karena mungkin dipakai situs default IIS)
3. Klik **OK**.
4. Kalau muncul warning "port sudah dipakai", ganti ke port lain (misal `8082`) — **catat port ini**, akan dipakai lagi di Bagian 9 & saat setting Admin Console.

### 6.1 Set `ASPNETCORE_ENVIRONMENT=Production`

1. Klik site **KKCS Backend** di panel kiri.
2. Di panel tengah, double-click **Configuration Editor**.
3. Di dropdown **Section**, ketik/pilih: `system.webServer/aspNetCore`.
4. Klik kolom **environmentVariables** → klik tombol `...` di ujung kanan baris tersebut.
5. Klik **Add** (ikon kertas di kanan atas popup) → isi:
   - **Name**: `ASPNETCORE_ENVIRONMENT`
   - **Value**: `Production`
6. Klik **Close**, lalu klik **Apply** di panel Actions (kanan atas).
7. **Restart site**: klik kanan site **KKCS Backend** → **Manage Website** → **Restart**.

> Alternatif lebih cepat: buka file `C:\inetpub\kkcs-backend\web.config` dengan Notepad, cari tag `<aspNetCore ...>`, tambahkan di dalamnya:
> ```xml
> <environmentVariables>
>   <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
> </environmentVariables>
> ```
> Simpan, lalu restart site seperti langkah 7 di atas.

---

## Bagian 7 — Test Backend Sudah Hidup

1. Di server (atau komputer lain di jaringan yang sama), buka browser.
2. Akses: `http://<IP-atau-hostname-server>:8081/api/auth/me` (ganti port sesuai Bagian 6).
3. **Hasil yang benar**: halaman menampilkan tulisan singkat semacam `{"message":"..."}"` dengan status **401 Unauthorized** (bisa dicek lewat DevTools browser, tab Network). Ini **normal dan bagus** — artinya backend hidup dan menolak akses tanpa login, sesuai desain.
4. **Kalau muncul error** (HTTP Error 500.19, 500.30, atau 502.5), lihat Bagian 10 (Troubleshooting) di bawah.

---

## Bagian 8 — Beri Izin Tulis untuk Folder Upload

Backend menyimpan file upload (bukti transfer, dokumen, foto profil) ke `wwwroot\uploads`. IIS App Pool butuh izin **Modify** ke folder ini, kalau tidak, setiap upload akan gagal dengan error 500.

1. Buka **File Explorer**, arahkan ke `C:\inetpub\kkcs-backend\wwwroot`.
2. Klik kanan folder **uploads** → **Properties** → tab **Security** → **Edit...**
3. Klik **Add...**
4. Ketik: `IIS AppPool\kkcs-backend` (nama ini otomatis terbentuk dari nama Application Pool di Bagian 5 — Windows mengenalinya walau belum terdaftar sebagai user biasa).
5. Klik **Check Names** — kalau ditemukan, nama akan bergaris bawah otomatis. Klik **OK**.
6. Di daftar permission, centang **Modify** dan **Write** untuk user tersebut.
7. Klik **OK** → **OK** lagi untuk menutup.
8. Test dengan mencoba salah satu fitur upload dari Admin Console atau aplikasi mobile (setelah Bagian 9 selesai).

---

## Bagian 9 — Buat Website Admin Console di IIS

1. Klik kanan **Application Pools** → **Add Application Pool...** → Name: `kkcs-admin`, .NET CLR version: **No Managed Code** → OK. (Situs statis tidak butuh ASP.NET, tapi pool terpisah tetap baik supaya tidak tercampur dengan backend.)
2. Klik kanan **Sites** → **Add Website...**
3. Isi:
   - **Site name**: `KKCS Admin`
   - **Application pool**: pilih `kkcs-admin`
   - **Physical path**: `C:\inetpub\kkcs-admin`
   - **Binding**: Type `http`, Port `8080` (atau port lain yang belum dipakai, beda dari port backend)
4. Klik **OK**.
5. **Penting**: pastikan sebelum build (`npm run build`), file `admin/.env.production` sudah berisi `VITE_API_BASE_URL=http://<IP-server>:8081` (port backend dari Bagian 6) — kalau lupa/salah, Admin Console akan ter-load tapi gagal login karena salah memanggil alamat backend. Kalau ternyata salah, perbaiki `.env.production`, jalankan ulang `npm run build`, lalu salin ulang isi `admin/dist` ke `C:\inetpub\kkcs-admin` (timpa yang lama).

---

## Bagian 10 — Test Admin Console End-to-End

1. Buka browser, akses `http://<IP-server>:8080` (port Admin Console dari Bagian 9).
2. Halaman login KKCS Admin Console harus muncul.
3. Coba login pakai akun Admin/Pengurus yang sudah ada di database.
4. Kalau berhasil masuk ke Dashboard, deployment **selesai dan berfungsi**.
5. Coba satu-dua fitur yang menyentuh backend (lihat Direktori Anggota, buka Panduan Pengurus → Unduh Manual Book) untuk memastikan koneksi ke database & file PDF juga berjalan normal.

---

## Bagian 11 — Troubleshooting Error Umum

| Error | Kemungkinan Penyebab | Solusi |
|---|---|---|
| **HTTP Error 500.19 - Internal Server Error** saat akses backend | Module ASP.NET Core belum terpasang / `web.config` rusak | Pastikan Hosting Bundle sudah diinstal (Bagian 2) dan sudah `iisreset`. Cek `web.config` di folder publish tidak terhapus/berubah. |
| **HTTP Error 500.30 - ASP.NET Core app failed to start** | Aplikasi crash saat start — biasanya connection string salah, atau `appsettings.Production.json` tidak ke-copy | Cek **Event Viewer** (Windows Logs → Application) untuk pesan error detail. Pastikan `appsettings.Production.json` ada di `C:\inetpub\kkcs-backend` dan connection string benar. |
| **HTTP Error 502.5 - Process Failure** | Sama seperti 500.30, umumnya aplikasi gagal start | Cek Event Viewer, atau jalankan manual dari Command Prompt: `cd C:\inetpub\kkcs-backend` lalu `dotnet backend.dll` — pesan error akan langsung terlihat di layar. |
| Admin Console tampil tapi login gagal / "Failed to fetch" | `VITE_API_BASE_URL` salah, port backend salah, atau backend belum jalan | Cek Bagian 9 langkah 5. Buka DevTools browser (F12) → tab Network → lihat request ke `/api/auth/login` gagal ke alamat mana. |
| Upload file (bukti transfer dll) gagal terus | Folder `wwwroot\uploads` belum diberi izin Modify | Ulangi Bagian 8, pastikan nama `IIS AppPool\kkcs-backend` persis benar saat "Check Names". |
| PDF ter-download tapi logo KKCS tidak muncul | File `wwwroot\logo-kkcs.png` tidak ikut ter-copy saat publish/salin | Cek manual file itu ada di `C:\inetpub\kkcs-backend\wwwroot\logo-kkcs.png`. Kalau tidak ada, salin ulang dari folder `backend\wwwroot\logo-kkcs.png` di komputer development. |
| Koneksi ke database gagal / timeout | SQL Server tidak menerima koneksi dari server IIS | Ulangi pengecekan Bagian 3 (TCP/IP, firewall, `Test-NetConnection`). |

---

Setelah semua langkah di atas beres dan checklist di `README.md` bagian 5 tercentang semua, deployment dianggap selesai.
