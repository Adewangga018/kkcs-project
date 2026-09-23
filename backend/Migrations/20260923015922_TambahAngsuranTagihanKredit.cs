using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAngsuranTagihanKredit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AngsuranPerBulan",
                table: "TagihanKredit",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenorBulan",
                table: "TagihanKredit",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AngsuranTagihanKredit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TagihanKreditId = table.Column<int>(type: "int", nullable: false),
                    AngsuranKe = table.Column<int>(type: "int", nullable: false),
                    JatuhTempo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    JumlahDibayar = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DibayarPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AngsuranTagihanKredit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AngsuranTagihanKredit_TagihanKredit_TagihanKreditId",
                        column: x => x.TagihanKreditId,
                        principalTable: "TagihanKredit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Produk",
                columns: new[] { "Id", "Aktif", "CatatanReview", "Deskripsi", "DiajukanOlehId", "DiperbaruiPada", "FotoUrl", "Harga", "Jenis", "Kode", "Nama", "Satuan", "Status", "Stok", "Sumber" },
                values: new object[] { 4, false, null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, 0m, "Jual", "PRD-MIGRASI", "Migrasi Data Lama", "paket", "Disetujui", 0m, "Koperasi" });

            migrationBuilder.CreateIndex(
                name: "IX_AngsuranTagihanKredit_TagihanKreditId_AngsuranKe",
                table: "AngsuranTagihanKredit",
                columns: new[] { "TagihanKreditId", "AngsuranKe" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AngsuranTagihanKredit");

            migrationBuilder.DeleteData(
                table: "Produk",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "AngsuranPerBulan",
                table: "TagihanKredit");

            migrationBuilder.DropColumn(
                name: "TenorBulan",
                table: "TagihanKredit");
        }
    }
}
