using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <summary>
    /// Prosedur untuk memverifikasi integritas rantai hash di <c>DbAuditLog</c> — menghitung ulang hash
    /// tiap baris dari data yang tersimpan dan membandingkannya dengan kolom Hash/PrevHash. Baris kosong
    /// (tidak ada hasil) berarti rantai utuh; baris manapun yang tampil berarti ada indikasi baris log
    /// diedit/disisipkan/dihapus di luar jalur trigger normal (verifikasi dijalankan di server, bukan
    /// C#, supaya tidak ada risiko selisih pemformatan tanggal lintas bahasa).
    /// </summary>
    public partial class TambahVerifikasiDbAuditChain : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE PROCEDURE dbo.sp_VerifikasiDbAuditChain
                AS
                BEGIN
                    SET NOCOUNT ON;
                    ;WITH berurutan AS (
                        SELECT
                            Id, Tabel, Operasi, KunciPrimer, DataSebelum, DataSesudah, WaktuUtc, DbLogin, AppName, HostName, PrevHash, Hash,
                            LAG(Hash) OVER (ORDER BY Id) AS HashBarisSebelumnya
                        FROM dbo.DbAuditLog
                    ),
                    dihitungUlang AS (
                        SELECT *,
                            LOWER(CONVERT(varchar(64), HASHBYTES('SHA2_256',
                                CONCAT(PrevHash, '|', Tabel, '|', Operasi, '|', KunciPrimer, '|',
                                       ISNULL(DataSebelum, ''), '|', ISNULL(DataSesudah, ''), '|',
                                       CONVERT(nvarchar(33), WaktuUtc, 126), '|', DbLogin)
                            ), 2)) AS HashDihitungUlang,
                            ISNULL(HashBarisSebelumnya, REPLICATE('0', 64)) AS PrevHashSeharusnya
                        FROM berurutan
                    )
                    SELECT Id, Tabel, Operasi, KunciPrimer, WaktuUtc, DbLogin,
                        CAST(CASE WHEN Hash <> HashDihitungUlang THEN 1 ELSE 0 END AS bit) AS HashTidakCocok,
                        CAST(CASE WHEN PrevHash <> PrevHashSeharusnya THEN 1 ELSE 0 END AS bit) AS RantaiTerputus
                    FROM dihitungUlang
                    WHERE Hash <> HashDihitungUlang OR PrevHash <> PrevHashSeharusnya
                    ORDER BY Id;
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_VerifikasiDbAuditChain;");
        }
    }
}
