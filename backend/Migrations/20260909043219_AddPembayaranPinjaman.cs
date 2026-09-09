using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPembayaranPinjaman : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PembayaranPinjaman",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PinjamanId = table.Column<int>(type: "int", nullable: false),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Jenis = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    JumlahDiajukan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    JasaDibebaskan = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Catatan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AngsuranKe = table.Column<int>(type: "int", nullable: true),
                    DiajukanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiputuskanPada = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PembayaranPinjaman", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PembayaranPinjaman_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PembayaranPinjaman_Pinjaman_PinjamanId",
                        column: x => x.PinjamanId,
                        principalTable: "Pinjaman",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PembayaranPinjaman_PenggunaId",
                table: "PembayaranPinjaman",
                column: "PenggunaId");

            migrationBuilder.CreateIndex(
                name: "IX_PembayaranPinjaman_PinjamanId_Status",
                table: "PembayaranPinjaman",
                columns: new[] { "PinjamanId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PembayaranPinjaman");
        }
    }
}
