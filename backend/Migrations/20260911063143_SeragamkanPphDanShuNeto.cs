using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeragamkanPphDanShuNeto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TarifPphBungaSukarela",
                table: "KonfigurasiKoperasi",
                newName: "TarifPph");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPajak",
                table: "ShuRun",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Pajak",
                table: "ShuAnggota",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalShuNeto",
                table: "ShuAnggota",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalPajak",
                table: "ShuRun");

            migrationBuilder.DropColumn(
                name: "Pajak",
                table: "ShuAnggota");

            migrationBuilder.DropColumn(
                name: "TotalShuNeto",
                table: "ShuAnggota");

            migrationBuilder.RenameColumn(
                name: "TarifPph",
                table: "KonfigurasiKoperasi",
                newName: "TarifPphBungaSukarela");
        }
    }
}
