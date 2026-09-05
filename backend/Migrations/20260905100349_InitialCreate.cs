using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Anggota",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomorAnggota = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NamaLengkap = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NomorIdentitas = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    NomorTelepon = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Alamat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TanggalBergabung = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Aktif = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Anggota", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Anggota_NomorAnggota",
                table: "Anggota",
                column: "NomorAnggota",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Anggota");
        }
    }
}
