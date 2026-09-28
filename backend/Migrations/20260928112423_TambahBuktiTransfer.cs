using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahBuktiTransfer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuktiTransferUrl",
                table: "TransaksiSukarela",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuktiTransferUrl",
                table: "SimpananBerjangka",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuktiTransferUrl",
                table: "PembayaranPinjaman",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BuktiTransferUrl",
                table: "TransaksiSukarela");

            migrationBuilder.DropColumn(
                name: "BuktiTransferUrl",
                table: "SimpananBerjangka");

            migrationBuilder.DropColumn(
                name: "BuktiTransferUrl",
                table: "PembayaranPinjaman");
        }
    }
}
