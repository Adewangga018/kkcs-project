using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPinjamanDanAngsuran : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BungaBulanan",
                table: "PengajuanPinjaman",
                newName: "BungaTahunan");

            migrationBuilder.AddColumn<string>(
                name: "CatatanReview",
                table: "PengajuanPinjaman",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DiputuskanPada",
                table: "PengajuanPinjaman",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimasiTotalJasa",
                table: "PengajuanPinjaman",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Pinjaman",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    PengajuanPinjamanId = table.Column<int>(type: "int", nullable: false),
                    NomorPinjaman = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Pokok = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TenorBulan = table.Column<int>(type: "int", nullable: false),
                    BungaTahunan = table.Column<decimal>(type: "decimal(5,4)", precision: 5, scale: 4, nullable: false),
                    PokokPerBulan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    JasaPerBulan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AngsuranPerBulan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SisaPokok = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AngsuranTerbayar = table.Column<int>(type: "int", nullable: false),
                    TanggalMulai = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LunasPada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pinjaman", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pinjaman_PengajuanPinjaman_PengajuanPinjamanId",
                        column: x => x.PengajuanPinjamanId,
                        principalTable: "PengajuanPinjaman",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pinjaman_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AngsuranPinjaman",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PinjamanId = table.Column<int>(type: "int", nullable: false),
                    AngsuranKe = table.Column<int>(type: "int", nullable: false),
                    JatuhTempo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Pokok = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Jasa = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Jenis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    JumlahDibayar = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DibayarPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AngsuranPinjaman", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AngsuranPinjaman_Pinjaman_PinjamanId",
                        column: x => x.PinjamanId,
                        principalTable: "Pinjaman",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AngsuranPinjaman_PinjamanId_AngsuranKe",
                table: "AngsuranPinjaman",
                columns: new[] { "PinjamanId", "AngsuranKe" });

            migrationBuilder.CreateIndex(
                name: "IX_Pinjaman_NomorPinjaman",
                table: "Pinjaman",
                column: "NomorPinjaman",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pinjaman_PengajuanPinjamanId",
                table: "Pinjaman",
                column: "PengajuanPinjamanId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pinjaman_PenggunaId",
                table: "Pinjaman",
                column: "PenggunaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AngsuranPinjaman");

            migrationBuilder.DropTable(
                name: "Pinjaman");

            migrationBuilder.DropColumn(
                name: "CatatanReview",
                table: "PengajuanPinjaman");

            migrationBuilder.DropColumn(
                name: "DiputuskanPada",
                table: "PengajuanPinjaman");

            migrationBuilder.DropColumn(
                name: "EstimasiTotalJasa",
                table: "PengajuanPinjaman");

            migrationBuilder.RenameColumn(
                name: "BungaTahunan",
                table: "PengajuanPinjaman",
                newName: "BungaBulanan");
        }
    }
}
