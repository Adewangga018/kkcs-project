using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAkuntansiDanShu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AkunAkuntansi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Kode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Nama = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Tipe = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SaldoNormal = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Sistem = table.Column<bool>(type: "bit", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AkunAkuntansi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JurnalEntri",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomorJurnal = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Tanggal = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Keterangan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Sumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReferensiModul = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ReferensiId = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    DicatatOlehId = table.Column<int>(type: "int", nullable: true),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JurnalEntri", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JurnalEntri_Pengguna_DicatatOlehId",
                        column: x => x.DicatatOlehId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ShuRun",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tahun = table.Column<int>(type: "int", nullable: false),
                    TotalShu = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PersenJasaModal = table.Column<decimal>(type: "decimal(5,4)", precision: 5, scale: 4, nullable: false),
                    PersenJasaUsaha = table.Column<decimal>(type: "decimal(5,4)", precision: 5, scale: 4, nullable: false),
                    TotalSimpananSemuaAnggota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalTransaksiSemuaAnggota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DifinalisasiPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DifinalisasiOlehId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShuRun", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShuRun_Pengguna_DifinalisasiOlehId",
                        column: x => x.DifinalisasiOlehId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "JurnalBaris",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JurnalEntriId = table.Column<int>(type: "int", nullable: false),
                    AkunId = table.Column<int>(type: "int", nullable: false),
                    Debit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Kredit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Keterangan = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JurnalBaris", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JurnalBaris_AkunAkuntansi_AkunId",
                        column: x => x.AkunId,
                        principalTable: "AkunAkuntansi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JurnalBaris_JurnalEntri_JurnalEntriId",
                        column: x => x.JurnalEntriId,
                        principalTable: "JurnalEntri",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShuAnggota",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShuRunId = table.Column<int>(type: "int", nullable: false),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    SimpananAnggota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TransaksiAnggota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Jma = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Jua = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalShu = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShuAnggota", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShuAnggota_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShuAnggota_ShuRun_ShuRunId",
                        column: x => x.ShuRunId,
                        principalTable: "ShuRun",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AkunAkuntansi",
                columns: new[] { "Id", "Aktif", "DibuatPada", "Kode", "Nama", "SaldoNormal", "Sistem", "Tipe" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1000", "Kas & Bank", "Debit", true, "Aset" },
                    { 2, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1200", "Piutang Pinjaman Anggota", "Debit", true, "Aset" },
                    { 3, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1300", "Piutang Kredit Produk (Potong Gaji)", "Debit", true, "Aset" },
                    { 4, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1400", "Persediaan Barang", "Debit", false, "Aset" },
                    { 5, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2200", "Simpanan Sukarela Anggota", "Kredit", true, "Liabilitas" },
                    { 6, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2300", "Simpanan Berjangka Anggota", "Kredit", true, "Liabilitas" },
                    { 7, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2400", "Utang PPh Ps 4(2) — Bunga Simpanan", "Kredit", true, "Liabilitas" },
                    { 8, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2500", "Utang SHU ke Anggota", "Kredit", true, "Liabilitas" },
                    { 9, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "3-3100", "Simpanan Pokok (Modal Anggota)", "Kredit", true, "Ekuitas" },
                    { 10, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "3-3200", "Simpanan Wajib (Modal Anggota)", "Kredit", true, "Ekuitas" },
                    { 11, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "3-3900", "SHU Ditahan / Cadangan", "Kredit", true, "Ekuitas" },
                    { 12, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "4-4100", "Pendapatan Jasa Pinjaman", "Kredit", true, "Pendapatan" },
                    { 13, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "4-4200", "Pendapatan Penjualan & Sewa Produk", "Kredit", true, "Pendapatan" },
                    { 14, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "4-4300", "Pendapatan Lain-lain", "Kredit", false, "Pendapatan" },
                    { 15, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5100", "Beban Bunga Simpanan Sukarela", "Debit", true, "Beban" },
                    { 16, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5200", "Beban Bunga Simpanan Berjangka", "Debit", true, "Beban" },
                    { 17, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5300", "Beban Pokok Penjualan", "Debit", false, "Beban" },
                    { 18, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5900", "Beban Operasional Lain (Gaji, Sewa, dll)", "Debit", false, "Beban" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AkunAkuntansi_Kode",
                table: "AkunAkuntansi",
                column: "Kode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JurnalBaris_AkunId",
                table: "JurnalBaris",
                column: "AkunId");

            migrationBuilder.CreateIndex(
                name: "IX_JurnalBaris_JurnalEntriId",
                table: "JurnalBaris",
                column: "JurnalEntriId");

            migrationBuilder.CreateIndex(
                name: "IX_JurnalEntri_DicatatOlehId",
                table: "JurnalEntri",
                column: "DicatatOlehId");

            migrationBuilder.CreateIndex(
                name: "IX_JurnalEntri_NomorJurnal",
                table: "JurnalEntri",
                column: "NomorJurnal",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JurnalEntri_Tanggal",
                table: "JurnalEntri",
                column: "Tanggal");

            migrationBuilder.CreateIndex(
                name: "IX_ShuAnggota_PenggunaId",
                table: "ShuAnggota",
                column: "PenggunaId");

            migrationBuilder.CreateIndex(
                name: "IX_ShuAnggota_ShuRunId_PenggunaId",
                table: "ShuAnggota",
                columns: new[] { "ShuRunId", "PenggunaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShuRun_DifinalisasiOlehId",
                table: "ShuRun",
                column: "DifinalisasiOlehId");

            migrationBuilder.CreateIndex(
                name: "IX_ShuRun_Tahun",
                table: "ShuRun",
                column: "Tahun",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JurnalBaris");

            migrationBuilder.DropTable(
                name: "ShuAnggota");

            migrationBuilder.DropTable(
                name: "AkunAkuntansi");

            migrationBuilder.DropTable(
                name: "JurnalEntri");

            migrationBuilder.DropTable(
                name: "ShuRun");
        }
    }
}
