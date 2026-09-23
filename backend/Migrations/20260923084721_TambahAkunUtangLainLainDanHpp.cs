using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAkunUtangLainLainDanHpp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AkunAkuntansi",
                columns: new[] { "Id", "Aktif", "DibuatPada", "Kode", "Nama", "SaldoNormal", "Sistem", "Tipe" },
                values: new object[,]
                {
                    { 28, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2650", "Utang Lain-lain", "Kredit", false, "Liabilitas" },
                    { 29, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2660", "Biaya Yang Masih Harus Dibayar", "Kredit", false, "Liabilitas" },
                    { 30, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5400", "Beban Pokok Pinjaman (HPP)", "Debit", false, "Beban" },
                    { 31, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "5-5930", "Beban di Luar Usaha", "Debit", false, "Beban" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 31);
        }
    }
}
