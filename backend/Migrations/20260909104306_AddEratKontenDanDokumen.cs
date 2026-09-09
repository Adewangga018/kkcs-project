using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddEratKontenDanDokumen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LaporanTahunan_Tahun",
                table: "LaporanTahunan");

            migrationBuilder.AddColumn<string>(
                name: "Deskripsi",
                table: "LaporanTahunan",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LaporanTahunan_Tahun",
                table: "LaporanTahunan",
                column: "Tahun");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LaporanTahunan_Tahun",
                table: "LaporanTahunan");

            migrationBuilder.DropColumn(
                name: "Deskripsi",
                table: "LaporanTahunan");

            migrationBuilder.CreateIndex(
                name: "IX_LaporanTahunan_Tahun",
                table: "LaporanTahunan",
                column: "Tahun",
                unique: true);
        }
    }
}
