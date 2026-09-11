using System.Linq;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <summary>
    /// Lapisan audit di level database (bukan aplikasi): trigger pada tabel-tabel finansial sensitif
    /// mencatat SETIAP perubahan — baik lewat API maupun lewat koneksi SQL langsung (dBeaver, SSMS, dll) —
    /// ke tabel <c>DbAuditLog</c> yang dirantai dengan hash (hash-chain) sehingga edit/hapus retroaktif
    /// terhadap baris log itu sendiri bisa terdeteksi lewat endpoint verifikasi integritas.
    /// Lihat juga <see cref="AuditLog"/> (jejak level aplikasi, mencatat siapa/lewat menu apa) — dua lapisan
    /// ini saling melengkapi: AuditLog menjawab "siapa pengguna aplikasi yang melakukan ini", DbAuditLog
    /// menjawab "apakah data pernah berubah di luar sepengetahuan aplikasi".
    /// </summary>
    public partial class TambahDbAuditTrail : Migration
    {
        // Tabel finansial/sensitif yang diaudit di level DB, beserta daftar kolom yang direkam.
        // "*" berarti seluruh kolom disertakan; Pengguna sengaja mengecualikan PasswordHash agar hash
        // password tidak pernah tersimpan/terekspos di log audit.
        private static readonly (string Tabel, string Kolom)[] TabelDiaudit =
        [
            ("Simpanan", "*"),
            ("MutasiSimpanan", "*"),
            ("SimpananBerjangka", "*"),
            ("Pinjaman", "*"),
            ("AngsuranPinjaman", "*"),
            ("JurnalEntri", "*"),
            ("JurnalBaris", "*"),
            ("ShuRun", "*"),
            ("ShuAnggota", "*"),
            ("KonfigurasiKoperasi", "*"),
            ("Pengguna", "Id,NamaLengkap,NomorIndukKaryawan,Peran,Email,NomorTelepon,Alamat,FotoUrl,Aktif,StatusKeanggotaan,DisetujuiPada,DibuatPada"),
        ];

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE TABLE dbo.DbAuditLog (
                    Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_DbAuditLog PRIMARY KEY,
                    Tabel nvarchar(60) NOT NULL,
                    Operasi nvarchar(10) NOT NULL,
                    KunciPrimer nvarchar(50) NOT NULL,
                    DataSebelum nvarchar(max) NULL,
                    DataSesudah nvarchar(max) NULL,
                    WaktuUtc datetime2 NOT NULL,
                    DbLogin nvarchar(128) NOT NULL,
                    AppName nvarchar(128) NULL,
                    HostName nvarchar(128) NULL,
                    PrevHash char(64) NOT NULL,
                    Hash char(64) NOT NULL
                );
                CREATE INDEX IX_DbAuditLog_Tabel ON dbo.DbAuditLog (Tabel);
                CREATE INDEX IX_DbAuditLog_WaktuUtc ON dbo.DbAuditLog (WaktuUtc);
                """);

            // INSERT-only dari kode aplikasi: tidak ada endpoint/API yang pernah UPDATE atau DELETE baris
            // di tabel ini — satu-satunya jalur tulis adalah prosedur sp_CatatDbAudit di bawah, dipanggil
            // oleh trigger. Penguncian akses lebih lanjut (REVOKE UPDATE/DELETE dari login aplikasi) perlu
            // dilakukan terpisah oleh DBA — lihat skrip db-hardening.sql.

            migrationBuilder.Sql(
                """
                CREATE PROCEDURE dbo.sp_CatatDbAudit
                    @Tabel nvarchar(60),
                    @Operasi nvarchar(10),
                    @KunciPrimer nvarchar(50),
                    @DataSebelum nvarchar(max),
                    @DataSesudah nvarchar(max)
                AS
                BEGIN
                    SET NOCOUNT ON;

                    -- Serialisasi penulisan rantai hash antar transaksi konkuren; lock dilepas otomatis
                    -- saat transaksi (yang sama dengan transaksi trigger pemanggil) commit/rollback.
                    DECLARE @lockResult int;
                    EXEC @lockResult = sp_getapplock @Resource = 'DbAuditChain', @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 15000;
                    IF @lockResult < 0
                    BEGIN
                        THROW 51000, 'Gagal mengunci rantai audit database (timeout/deadlock).', 1;
                    END

                    DECLARE @PrevHash char(64);
                    SELECT TOP 1 @PrevHash = Hash FROM dbo.DbAuditLog ORDER BY Id DESC;
                    IF @PrevHash IS NULL SET @PrevHash = REPLICATE('0', 64);

                    DECLARE @WaktuUtc datetime2 = SYSUTCDATETIME();
                    DECLARE @DbLogin nvarchar(128) = ORIGINAL_LOGIN();
                    DECLARE @AppName nvarchar(128) = APP_NAME();
                    DECLARE @HostName nvarchar(128) = HOST_NAME();

                    DECLARE @Payload nvarchar(max) = CONCAT(
                        @PrevHash, '|', @Tabel, '|', @Operasi, '|', @KunciPrimer, '|',
                        ISNULL(@DataSebelum, ''), '|', ISNULL(@DataSesudah, ''), '|',
                        CONVERT(nvarchar(33), @WaktuUtc, 126), '|', @DbLogin);
                    DECLARE @Hash char(64) = LOWER(CONVERT(varchar(64), HASHBYTES('SHA2_256', @Payload), 2));

                    INSERT INTO dbo.DbAuditLog (Tabel, Operasi, KunciPrimer, DataSebelum, DataSesudah, WaktuUtc, DbLogin, AppName, HostName, PrevHash, Hash)
                    VALUES (@Tabel, @Operasi, @KunciPrimer, @DataSebelum, @DataSesudah, @WaktuUtc, @DbLogin, @AppName, @HostName, @PrevHash, @Hash);
                END
                """);

            foreach (var (tabel, kolom) in TabelDiaudit)
            {
                var kolomSebelum = kolom == "*" ? "dd.*" : string.Join(",", kolom.Split(',').Select(k => $"dd.{k}"));
                var kolomSesudah = kolom == "*" ? "ii.*" : string.Join(",", kolom.Split(',').Select(k => $"ii.{k}"));
                migrationBuilder.Sql(
                    $"""
                    CREATE TRIGGER dbo.trg_Audit_{tabel} ON dbo.{tabel}
                    AFTER INSERT, UPDATE, DELETE
                    AS
                    BEGIN
                        SET NOCOUNT ON;
                        DECLARE @rows TABLE (Op nvarchar(10), RowId nvarchar(50), Before nvarchar(max), After nvarchar(max));

                        INSERT INTO @rows (Op, RowId, Before, After)
                        SELECT
                            CASE WHEN d.Id IS NULL THEN 'INSERT' WHEN i.Id IS NULL THEN 'DELETE' ELSE 'UPDATE' END,
                            CAST(COALESCE(i.Id, d.Id) AS nvarchar(50)),
                            (SELECT {kolomSebelum} FROM deleted dd WHERE dd.Id = d.Id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                            (SELECT {kolomSesudah} FROM inserted ii WHERE ii.Id = i.Id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
                        FROM inserted i FULL OUTER JOIN deleted d ON i.Id = d.Id;

                        DECLARE @Op nvarchar(10), @RowId nvarchar(50), @Before nvarchar(max), @After nvarchar(max);
                        DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT Op, RowId, Before, After FROM @rows;
                        OPEN cur;
                        FETCH NEXT FROM cur INTO @Op, @RowId, @Before, @After;
                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            EXEC dbo.sp_CatatDbAudit @Tabel = '{tabel}', @Operasi = @Op, @KunciPrimer = @RowId, @DataSebelum = @Before, @DataSesudah = @After;
                            FETCH NEXT FROM cur INTO @Op, @RowId, @Before, @After;
                        END
                        CLOSE cur; DEALLOCATE cur;
                    END
                    """);
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var (tabel, _) in TabelDiaudit.Reverse())
            {
                migrationBuilder.Sql($"DROP TRIGGER IF EXISTS dbo.trg_Audit_{tabel};");
            }
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_CatatDbAudit;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS dbo.DbAuditLog;");
        }
    }
}
