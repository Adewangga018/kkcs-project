-- ============================================================================
-- db-hardening.sql — Skrip referensi, TIDAK dijalankan otomatis oleh migrasi.
--
-- Trigger audit (lihat Migrations/TambahDbAuditTrail) mencatat perubahan data,
-- tapi trigger itu sendiri bisa dilewati oleh siapa pun yang punya izin ALTER
-- pada tabelnya (bisa DISABLE TRIGGER), dan baris DbAuditLog bisa diubah/dihapus
-- oleh siapa pun yang punya izin UPDATE/DELETE ke tabel itu. Skrip ini mengunci
-- keduanya dengan prinsip least-privilege.
--
-- CARA PAKAI:
--   1. Ganti [NAMA_LOGIN_APLIKASI] di bawah dengan login SQL yang dipakai
--      backend (connection string di appsettings.json). Kalau backend masih
--      memakai Trusted_Connection (Windows Auth akun developer/service),
--      buat login SQL/Windows khusus untuk aplikasi terlebih dahulu — JANGAN
--      pakai akun sysadmin/akun pribadi developer untuk koneksi runtime app.
--   2. Jalankan sebagai sysadmin/db_owner, sekali, lewat SSMS atau sqlcmd —
--      BUKAN lewat `dotnet ef database update` (izin di bawah akan membuat
--      migrasi berikutnya gagal kalau dijalankan dengan login yang sama).
--   3. Kalau butuh menjalankan migrasi baru setelah ini, pakai login terpisah
--      yang py db_owner (mis. akun DBA), lalu jalankan skrip ini ulang setiap
--      kali menambah tabel baru yang perlu diaudit.
-- ============================================================================

DECLARE @loginAplikasi sysname = N'[NAMA_LOGIN_APLIKASI]'; -- GANTI SEBELUM DIJALANKAN

-- 1) AuditLog & DbAuditLog: aplikasi (dan siapa pun) hanya boleh INSERT.
--    Even AuditService di kode C# hanya pernah melakukan INSERT — tidak pernah
--    UPDATE/DELETE — jadi mencabut izin ini tidak memutus fungsi apa pun.
REVOKE UPDATE, DELETE ON dbo.AuditLog FROM [NAMA_LOGIN_APLIKASI];
REVOKE UPDATE, DELETE ON dbo.DbAuditLog FROM [NAMA_LOGIN_APLIKASI];
DENY UPDATE, DELETE ON dbo.AuditLog TO [NAMA_LOGIN_APLIKASI];
DENY UPDATE, DELETE ON dbo.DbAuditLog TO [NAMA_LOGIN_APLIKASI];

-- 2) Cegah trigger di-nonaktifkan diam-diam: butuh izin ALTER pada tabel untuk
--    DISABLE TRIGGER, jadi cabut ALTER dari login aplikasi pada tabel-tabel
--    yang diaudit (aplikasi tidak pernah butuh ALTER TABLE saat runtime).
DENY ALTER ON dbo.Simpanan TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.MutasiSimpanan TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.SimpananBerjangka TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.Pinjaman TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.AngsuranPinjaman TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.JurnalEntri TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.JurnalBaris TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.ShuRun TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.ShuAnggota TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.KonfigurasiKoperasi TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.Pengguna TO [NAMA_LOGIN_APLIKASI];

-- 3) Cabut ALTER pada prosedur/tabel audit itu sendiri, supaya logikanya
--    (termasuk rumus hash) tidak bisa diam-diam diganti dari login aplikasi.
DENY ALTER ON dbo.sp_CatatDbAudit TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.sp_VerifikasiDbAuditChain TO [NAMA_LOGIN_APLIKASI];
DENY ALTER ON dbo.DbAuditLog TO [NAMA_LOGIN_APLIKASI];

-- ============================================================================
-- CATATAN PENTING soal atribusi "siapa":
--
-- Kolom DbLogin di DbAuditLog merekam ORIGINAL_LOGIN() — login SQL/Windows
-- yang benar-benar dipakai koneksi tersebut. Kalau SEMUA koneksi (aplikasi
-- maupun siapa pun yang login manual lewat dBeaver/SSMS) memakai satu login
-- bersama yang sama (mis. Trusted_Connection akun developer, atau satu akun
-- "sa" yang dipakai bersama), kolom ini TIDAK BISA membedakan "aplikasi yang
-- menulis" dari "seseorang yang login manual dengan kredensial yang sama".
--
-- Supaya audit ini benar-benar bisa melacak "siapa", pastikan:
--   - Aplikasi (backend/appsettings*.json) memakai SATU login SQL khusus,
--     berbeda dari kredensial siapa pun yang mengakses database secara manual.
--   - Setiap admin/DBA yang butuh akses langsung (dBeaver/SSMS) memakai LOGIN
--     PRIBADI masing-masing (Windows Auth per akun, atau login SQL per orang)
--     — bukan kredensial bersama — supaya ORIGINAL_LOGIN() menunjuk ke orang
--     yang tepat, bukan cuma "grup DBA" secara umum.
--   - Kredensial database (connection string) disimpan sebagai secret
--     (mis. environment variable / Key Vault), bukan di appsettings.json yang
--     ikut commit ke repo.
--
-- Untuk perlindungan lebih kuat (mencakup bahkan sysadmin yang mencoba
-- menghapus baris DbAuditLog lewat DAC/emergency mode, dan mencatat ke lokasi
-- di LUAR database itu sendiri), pertimbangkan mengaktifkan SQL Server Audit
-- native (CREATE SERVER AUDIT ... TO FILE) — perlu izin ALTER ANY SERVER AUDIT,
-- biasanya dijalankan oleh siapa pun yang mengelola instance SQL Server ini.
-- Tanyakan ke saya bila ingin skrip CREATE SERVER AUDIT-nya disiapkan.
-- ============================================================================
