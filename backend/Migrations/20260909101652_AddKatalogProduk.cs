using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddKatalogProduk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CatatanReview",
                table: "Produk",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Deskripsi",
                table: "Produk",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DiajukanOlehId",
                table: "Produk",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FotoUrl",
                table: "Produk",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Jenis",
                table: "Produk",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Produk",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Sumber",
                table: "Produk",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PembelianProduk",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProdukId = table.Column<int>(type: "int", nullable: false),
                    PembeliId = table.Column<int>(type: "int", nullable: false),
                    NomorTransaksi = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Jenis = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Jumlah = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    HargaSatuan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MetodePembayaran = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Catatan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiajukanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiprosesPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PembelianProduk", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PembelianProduk_Pengguna_PembeliId",
                        column: x => x.PembeliId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PembelianProduk_Produk_ProdukId",
                        column: x => x.ProdukId,
                        principalTable: "Produk",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TagihanKredit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PembelianProdukId = table.Column<int>(type: "int", nullable: false),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Keterangan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DibuatPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DikirimPada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LunasPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TagihanKredit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TagihanKredit_PembelianProduk_PembelianProdukId",
                        column: x => x.PembelianProdukId,
                        principalTable: "PembelianProduk",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TagihanKredit_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Produk",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CatatanReview", "Deskripsi", "DiajukanOlehId", "FotoUrl", "Jenis", "Status", "Sumber" },
                values: new object[] { null, null, null, null, "Jual", "Disetujui", "Koperasi" });

            migrationBuilder.UpdateData(
                table: "Produk",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CatatanReview", "Deskripsi", "DiajukanOlehId", "FotoUrl", "Jenis", "Status", "Sumber" },
                values: new object[] { null, null, null, null, "Jual", "Disetujui", "Koperasi" });

            migrationBuilder.UpdateData(
                table: "Produk",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CatatanReview", "Deskripsi", "DiajukanOlehId", "FotoUrl", "Jenis", "Status", "Sumber" },
                values: new object[] { null, null, null, null, "Jual", "Disetujui", "Koperasi" });

            migrationBuilder.CreateIndex(
                name: "IX_Produk_DiajukanOlehId",
                table: "Produk",
                column: "DiajukanOlehId");

            migrationBuilder.CreateIndex(
                name: "IX_PembelianProduk_NomorTransaksi",
                table: "PembelianProduk",
                column: "NomorTransaksi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PembelianProduk_PembeliId",
                table: "PembelianProduk",
                column: "PembeliId");

            migrationBuilder.CreateIndex(
                name: "IX_PembelianProduk_ProdukId",
                table: "PembelianProduk",
                column: "ProdukId");

            migrationBuilder.CreateIndex(
                name: "IX_TagihanKredit_PembelianProdukId",
                table: "TagihanKredit",
                column: "PembelianProdukId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TagihanKredit_PenggunaId",
                table: "TagihanKredit",
                column: "PenggunaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Produk_Pengguna_DiajukanOlehId",
                table: "Produk",
                column: "DiajukanOlehId",
                principalTable: "Pengguna",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Produk_Pengguna_DiajukanOlehId",
                table: "Produk");

            migrationBuilder.DropTable(
                name: "TagihanKredit");

            migrationBuilder.DropTable(
                name: "PembelianProduk");

            migrationBuilder.DropIndex(
                name: "IX_Produk_DiajukanOlehId",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "CatatanReview",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "Deskripsi",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "DiajukanOlehId",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "FotoUrl",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "Jenis",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Produk");

            migrationBuilder.DropColumn(
                name: "Sumber",
                table: "Produk");
        }
    }
}
