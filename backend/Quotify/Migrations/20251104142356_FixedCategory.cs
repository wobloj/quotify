using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quotify.Migrations
{
    /// <inheritdoc />
    public partial class FixedCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes");

            // Upewnij się, że kolumny/rekordy, które mają zostać ustawione na NOT NULL, nie zawierają wartości NULL.
            // 1) Wstaw domyślną kategorię (jeśli jeszcze nie istnieje).
            migrationBuilder.Sql(@"
                    INSERT INTO ""Categories"" (""Name"", ""Description"", ""CreatedAt"")
                    SELECT 'Uncategorized', 'Domyślna kategoria', NOW()
                    WHERE NOT EXISTS (SELECT 1 FROM ""Categories"" WHERE ""Name"" = 'Uncategorized');
                ");

            // 2) Zaktualizuj istniejące cytaty, które mają NULL w CategoryId, na id tej domyślnej kategorii.
            migrationBuilder.Sql(@"
                    UPDATE ""Quotes""
                    SET ""CategoryId"" = (SELECT ""Id"" FROM ""Categories"" WHERE ""Name"" = 'Uncategorized' LIMIT 1)
                    WHERE ""CategoryId"" IS NULL;
                ");

            // 3) Upewnij się, że Author nie jest NULL przed zmianą na NOT NULL.
            migrationBuilder.Sql(@"
                    UPDATE ""Quotes""
                    SET ""Author"" = ''
                    WHERE ""Author"" IS NULL;
                ");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Quotes",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Author",
                table: "Quotes",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Quotes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Author",
                table: "Quotes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Categories_CategoryId",
                table: "Quotes",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id");
        }
    }
}
