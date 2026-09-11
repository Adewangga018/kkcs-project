using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPphBungaSukarela : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BungaBruto",
                table: "PostingBungaSukarela",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BungaNeto",
                table: "PostingBungaSukarela",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Pajak",
                table: "PostingBungaSukarela",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TarifPphBungaSukarela",
                table: "KonfigurasiKoperasi",
                type: "decimal(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "KonfigurasiKoperasi",
                keyColumn: "Id",
                keyValue: 1,
                column: "TarifPphBungaSukarela",
                value: 0.20m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BungaBruto",
                table: "PostingBungaSukarela");

            migrationBuilder.DropColumn(
                name: "BungaNeto",
                table: "PostingBungaSukarela");

            migrationBuilder.DropColumn(
                name: "Pajak",
                table: "PostingBungaSukarela");

            migrationBuilder.DropColumn(
                name: "TarifPphBungaSukarela",
                table: "KonfigurasiKoperasi");
        }
    }
}
