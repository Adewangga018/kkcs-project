using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAkunPiutangLainLain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AkunAkuntansi",
                columns: new[] { "Id", "Aktif", "DibuatPada", "Kode", "Nama", "SaldoNormal", "Sistem", "Tipe" },
                values: new object[] { 27, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1250", "Piutang Lain-lain", "Debit", false, "Aset" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 27);
        }
    }
}
