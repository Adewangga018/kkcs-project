using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSistemSimpanan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DisetujuiPada",
                table: "Pengguna",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StatusKeanggotaan",
                table: "Pengguna",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Aktif");

            migrationBuilder.CreateTable(
                name: "KonfigurasiKoperasi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SimpananPokokNominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SimpananWajibNominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TanggalTagihWajib = table.Column<int>(type: "int", nullable: false),
                    DiperbaruiPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KonfigurasiKoperasi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProdukBerjangka",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nama = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TenorBulan = table.Column<int>(type: "int", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdukBerjangka", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TagihanWajib",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Periode = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    JatuhTempo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiprosesPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TagihanWajib", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TagihanWajib_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransaksiSukarela",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Jenis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Catatan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiajukanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiprosesPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransaksiSukarela", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransaksiSukarela_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SimpananBerjangka",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    ProdukBerjangkaId = table.Column<int>(type: "int", nullable: false),
                    NomorSertifikat = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TenorBulan = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiajukanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TanggalMulai = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TanggalJatuhTempo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DicairkanPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SimpananBerjangka", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SimpananBerjangka_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SimpananBerjangka_ProdukBerjangka_ProdukBerjangkaId",
                        column: x => x.ProdukBerjangkaId,
                        principalTable: "ProdukBerjangka",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "KonfigurasiKoperasi",
                columns: new[] { "Id", "DiperbaruiPada", "SimpananPokokNominal", "SimpananWajibNominal", "TanggalTagihWajib" },
                values: new object[] { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 100000m, 50000m, 25 });

            migrationBuilder.CreateIndex(
                name: "IX_SimpananBerjangka_NomorSertifikat",
                table: "SimpananBerjangka",
                column: "NomorSertifikat",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SimpananBerjangka_PenggunaId",
                table: "SimpananBerjangka",
                column: "PenggunaId");

            migrationBuilder.CreateIndex(
                name: "IX_SimpananBerjangka_ProdukBerjangkaId",
                table: "SimpananBerjangka",
                column: "ProdukBerjangkaId");

            migrationBuilder.CreateIndex(
                name: "IX_TagihanWajib_PenggunaId_Periode",
                table: "TagihanWajib",
                columns: new[] { "PenggunaId", "Periode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransaksiSukarela_PenggunaId_Status",
                table: "TransaksiSukarela",
                columns: new[] { "PenggunaId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KonfigurasiKoperasi");

            migrationBuilder.DropTable(
                name: "SimpananBerjangka");

            migrationBuilder.DropTable(
                name: "TagihanWajib");

            migrationBuilder.DropTable(
                name: "TransaksiSukarela");

            migrationBuilder.DropTable(
                name: "ProdukBerjangka");

            migrationBuilder.DropColumn(
                name: "DisetujuiPada",
                table: "Pengguna");

            migrationBuilder.DropColumn(
                name: "StatusKeanggotaan",
                table: "Pengguna");
        }
    }
}
