using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAkunKliringMigrasi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AkunAkuntansi",
                columns: new[] { "Id", "Aktif", "DibuatPada", "Kode", "Nama", "SaldoNormal", "Sistem", "Tipe" },
                values: new object[] { 23, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "3-3990", "Kliring Migrasi Data Lama", "Kredit", true, "Ekuitas" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 23);
        }
    }
}
