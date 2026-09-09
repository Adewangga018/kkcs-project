using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBungaSimpanan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BungaDibayar",
                table: "SimpananBerjangka",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BungaDepositoTahunan",
                table: "KonfigurasiKoperasi",
                type: "decimal(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BungaSukarelaTahunan",
                table: "KonfigurasiKoperasi",
                type: "decimal(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "PostingBungaSukarela",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Periode = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiposkanPada = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostingBungaSukarela", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostingBungaSukarela_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "KonfigurasiKoperasi",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BungaDepositoTahunan", "BungaSukarelaTahunan" },
                values: new object[] { 0.045m, 0.025m });

            migrationBuilder.CreateIndex(
                name: "IX_PostingBungaSukarela_PenggunaId_Periode",
                table: "PostingBungaSukarela",
                columns: new[] { "PenggunaId", "Periode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostingBungaSukarela");

            migrationBuilder.DropColumn(
                name: "BungaDibayar",
                table: "SimpananBerjangka");

            migrationBuilder.DropColumn(
                name: "BungaDepositoTahunan",
                table: "KonfigurasiKoperasi");

            migrationBuilder.DropColumn(
                name: "BungaSukarelaTahunan",
                table: "KonfigurasiKoperasi");
        }
    }
}
