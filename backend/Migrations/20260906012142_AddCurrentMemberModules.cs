using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrentMemberModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EratAgenda",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Judul = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Deskripsi = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MulaiPada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SelesaiPada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EratAgenda", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JenisSimpanan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Kode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Nama = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Deskripsi = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Aktif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JenisSimpanan", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LaporanTahunan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tahun = table.Column<int>(type: "int", nullable: false),
                    Judul = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DiterbitkanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaporanTahunan", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PengajuanPinjaman",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    NomorPengajuan = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TenorBulan = table.Column<int>(type: "int", nullable: false),
                    BungaBulanan = table.Column<decimal>(type: "decimal(5,4)", precision: 5, scale: 4, nullable: false),
                    EstimasiCicilanBulanan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Tujuan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PengajuanPinjaman", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PengajuanPinjaman_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Produk",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Kode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Nama = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Harga = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Stok = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    Satuan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false),
                    DiperbaruiPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produk", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EratOpsi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EratAgendaId = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Urutan = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EratOpsi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EratOpsi_EratAgenda_EratAgendaId",
                        column: x => x.EratAgendaId,
                        principalTable: "EratAgenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Simpanan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    JenisSimpananId = table.Column<int>(type: "int", nullable: false),
                    NomorRekening = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TanggalBuka = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Simpanan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Simpanan_JenisSimpanan_JenisSimpananId",
                        column: x => x.JenisSimpananId,
                        principalTable: "JenisSimpanan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Simpanan_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EratSuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EratAgendaId = table.Column<int>(type: "int", nullable: false),
                    EratOpsiId = table.Column<int>(type: "int", nullable: false),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    DipilihPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EratSuara", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EratSuara_EratAgenda_EratAgendaId",
                        column: x => x.EratAgendaId,
                        principalTable: "EratAgenda",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EratSuara_EratOpsi_EratOpsiId",
                        column: x => x.EratOpsiId,
                        principalTable: "EratOpsi",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EratSuara_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MutasiSimpanan",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SimpananId = table.Column<int>(type: "int", nullable: false),
                    Jenis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SaldoSetelah = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Keterangan = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    TanggalTransaksi = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MutasiSimpanan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MutasiSimpanan_Simpanan_SimpananId",
                        column: x => x.SimpananId,
                        principalTable: "Simpanan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "JenisSimpanan",
                columns: new[] { "Id", "Aktif", "Deskripsi", "Kode", "Nama" },
                values: new object[,]
                {
                    { 1, true, "Simpanan awal keanggotaan.", "POKOK", "Simpanan Pokok" },
                    { 2, true, "Simpanan berkala anggota.", "WAJIB", "Simpanan Wajib" },
                    { 3, true, "Simpanan tambahan sesuai kemampuan anggota.", "SUKARELA", "Simpanan Sukarela" },
                    { 4, true, "Simpanan dengan jangka waktu tertentu.", "BERJANGKA", "Simpanan Berjangka" }
                });

            migrationBuilder.InsertData(
                table: "Produk",
                columns: new[] { "Id", "Aktif", "DiperbaruiPada", "Harga", "Kode", "Nama", "Satuan", "Stok" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 78000m, "PRD-BRSPRM5", "Beras Premium 5 kg", "paket", 0m },
                    { 2, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 36500m, "PRD-MNYK2", "Minyak Goreng 2 L", "botol", 0m },
                    { 3, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 17000m, "PRD-GULA1", "Gula Pasir 1 kg", "paket", 0m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EratOpsi_EratAgendaId",
                table: "EratOpsi",
                column: "EratAgendaId");

            migrationBuilder.CreateIndex(
                name: "IX_EratSuara_EratAgendaId_PenggunaId",
                table: "EratSuara",
                columns: new[] { "EratAgendaId", "PenggunaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EratSuara_EratOpsiId",
                table: "EratSuara",
                column: "EratOpsiId");

            migrationBuilder.CreateIndex(
                name: "IX_EratSuara_PenggunaId",
                table: "EratSuara",
                column: "PenggunaId");

            migrationBuilder.CreateIndex(
                name: "IX_JenisSimpanan_Kode",
                table: "JenisSimpanan",
                column: "Kode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LaporanTahunan_Tahun",
                table: "LaporanTahunan",
                column: "Tahun",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MutasiSimpanan_SimpananId",
                table: "MutasiSimpanan",
                column: "SimpananId");

            migrationBuilder.CreateIndex(
                name: "IX_PengajuanPinjaman_NomorPengajuan",
                table: "PengajuanPinjaman",
                column: "NomorPengajuan",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PengajuanPinjaman_PenggunaId",
                table: "PengajuanPinjaman",
                column: "PenggunaId");

            migrationBuilder.CreateIndex(
                name: "IX_Produk_Kode",
                table: "Produk",
                column: "Kode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Simpanan_JenisSimpananId",
                table: "Simpanan",
                column: "JenisSimpananId");

            migrationBuilder.CreateIndex(
                name: "IX_Simpanan_NomorRekening",
                table: "Simpanan",
                column: "NomorRekening",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Simpanan_PenggunaId",
                table: "Simpanan",
                column: "PenggunaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EratSuara");

            migrationBuilder.DropTable(
                name: "LaporanTahunan");

            migrationBuilder.DropTable(
                name: "MutasiSimpanan");

            migrationBuilder.DropTable(
                name: "PengajuanPinjaman");

            migrationBuilder.DropTable(
                name: "Produk");

            migrationBuilder.DropTable(
                name: "EratOpsi");

            migrationBuilder.DropTable(
                name: "Simpanan");

            migrationBuilder.DropTable(
                name: "EratAgenda");

            migrationBuilder.DropTable(
                name: "JenisSimpanan");
        }
    }
}
