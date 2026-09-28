using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahSukarelaRutin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SukarelaRutin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PenggunaId = table.Column<int>(type: "int", nullable: false),
                    Nominal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TanggalSetor = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CatatanReview = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiajukanPada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiputuskanPada = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TerakhirDijalankanPeriode = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SukarelaRutin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SukarelaRutin_Pengguna_PenggunaId",
                        column: x => x.PenggunaId,
                        principalTable: "Pengguna",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SukarelaRutin_PenggunaId_Status",
                table: "SukarelaRutin",
                columns: new[] { "PenggunaId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SukarelaRutin");
        }
    }
}
