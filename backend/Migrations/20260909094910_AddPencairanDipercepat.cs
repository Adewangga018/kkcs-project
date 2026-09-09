using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPencairanDipercepat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AlasanPencairan",
                table: "SimpananBerjangka",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PencairanDiajukan",
                table: "SimpananBerjangka",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PencairanDiajukanPada",
                table: "SimpananBerjangka",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlasanPencairan",
                table: "SimpananBerjangka");

            migrationBuilder.DropColumn(
                name: "PencairanDiajukan",
                table: "SimpananBerjangka");

            migrationBuilder.DropColumn(
                name: "PencairanDiajukanPada",
                table: "SimpananBerjangka");
        }
    }
}
