using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahLaporanRatOtomatis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProfilKoperasi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Visi = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Misi = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AlamatKantor = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    TanggalDidirikan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NomorAktaPendirian = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TanggalAkta = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DiperbaruiPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfilKoperasi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RatTahunan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tahun = table.Column<int>(type: "int", nullable: false),
                    KegiatanBisnis = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    KegiatanSosial = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RencanaBisnisTahunDepan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RencanaSosialTahunDepan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RabPendapatanPinjaman = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RabPendapatanLain = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RabBebanOperasional = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RabBebanUmum = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RabCadanganPiutang = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    RealisasiPajakShu = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CatatanTambahan = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DiperbaruiPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RatTahunan", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ProfilKoperasi",
                columns: new[] { "Id", "AlamatKantor", "DiperbaruiPada", "Misi", "NomorAktaPendirian", "TanggalAkta", "TanggalDidirikan", "Visi" },
                values: new object[] { 1, "JL KIG RAYA SELATAN A-5, GRESIK 61121", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "A. Melaksanakan amanat AD/ART untuk melayani Anggota sebagai prioritas utama.\nB. Mengembangkan unit usaha yang sudah berjalan dan mengembangkan usaha baru.\nC. Bekerjasama dengan mitra usaha dan atau Lembaga Keuangan untuk memperkuat permodalan.\nD. Bersama dengan pihak-pihak berkepentingan mewujudkan kesejahteraan Anggota.", "160/BN/XVI.6/VI/2010", new DateTime(2010, 6, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2009, 7, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mendorong ekspansi usaha koperasi sehingga menjadi koperasi yang mandiri dan tangguh berlandaskan amanah dalam membangun ekonomi bersama dan berkeadilan demi kesejahteraan Anggota." });

            migrationBuilder.CreateIndex(
                name: "IX_RatTahunan_Tahun",
                table: "RatTahunan",
                column: "Tahun",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfilKoperasi");

            migrationBuilder.DropTable(
                name: "RatTahunan");
        }
    }
}
