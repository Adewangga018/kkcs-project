using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UseNikForAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pengguna_Email",
                table: "Pengguna");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pengguna",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AddColumn<string>(
                name: "NomorIndukKaryawan",
                table: "Pengguna",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Pengguna_NomorIndukKaryawan",
                table: "Pengguna",
                column: "NomorIndukKaryawan",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pengguna_NomorIndukKaryawan",
                table: "Pengguna");

            migrationBuilder.DropColumn(
                name: "NomorIndukKaryawan",
                table: "Pengguna");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pengguna",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pengguna_Email",
                table: "Pengguna",
                column: "Email",
                unique: true);
        }
    }
}
