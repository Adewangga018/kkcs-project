using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahAkunPiutangUtangNonAnggota : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AkunAkuntansi",
                columns: new[] { "Id", "Aktif", "DibuatPada", "Kode", "Nama", "SaldoNormal", "Sistem", "Tipe" },
                values: new object[,]
                {
                    { 24, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1500", "Piutang Non-Anggota", "Debit", false, "Aset" },
                    { 25, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "1-1510", "Cadangan Penyisihan Piutang Tak Tertagih", "Debit", false, "Aset" },
                    { 26, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2-2700", "Utang Non-Anggota", "Kredit", false, "Liabilitas" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "AkunAkuntansi",
                keyColumn: "Id",
                keyValue: 26);
        }
    }
}
