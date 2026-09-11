using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WaktuUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PelakuId = table.Column<int>(type: "int", nullable: true),
                    PelakuNama = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PelakuPeran = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Modul = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Aksi = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EntitasId = table.Column<int>(type: "int", nullable: true),
                    Ringkasan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AlamatIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_Modul",
                table: "AuditLog",
                column: "Modul");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_WaktuUtc",
                table: "AuditLog",
                column: "WaktuUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLog");
        }
    }
}
