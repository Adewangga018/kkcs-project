using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TambahPersenAnggotaShu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DikirimPada",
                table: "TagihanKredit");

            migrationBuilder.AddColumn<decimal>(
                name: "PersenAnggota",
                table: "ShuRun",
                type: "decimal(5,4)",
                precision: 5,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            // Catatan: SHU run yang sudah difinalisasi sebelum model 2-lapis ini ada akan punya PersenAnggota
            // = 0 (kolom baru, belum berlaku saat itu). Nominal per anggota (JMA/JUA/neto) di ShuAnggota tetap
            // akurat karena itu snapshot hasil hitung saat difinalisasi — hanya ringkasan Lapis 1/2 di Laporan
            // RAT untuk tahun-tahun lama itu yang tidak terisi; finalisasi ulang bila perlu breakdown lengkap.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PersenAnggota",
                table: "ShuRun");

            migrationBuilder.AddColumn<DateTime>(
                name: "DikirimPada",
                table: "TagihanKredit",
                type: "datetime2",
                nullable: true);
        }
    }
}
