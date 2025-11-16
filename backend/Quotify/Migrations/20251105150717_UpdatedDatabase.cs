using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quotify.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
