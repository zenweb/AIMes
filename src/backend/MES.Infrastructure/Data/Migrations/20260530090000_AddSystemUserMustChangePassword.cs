using System;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(MesDbContext))]
    [Migration("20260530090000_AddSystemUserMustChangePassword")]
    public partial class AddSystemUserMustChangePassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "system_users",
                keyColumn: "id",
                keyValue: "su-001");

            migrationBuilder.DeleteData(
                table: "system_users",
                keyColumn: "id",
                keyValue: "su-002");

            migrationBuilder.AddColumn<bool>(
                name: "must_change_password",
                table: "system_users",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "must_change_password",
                table: "system_users");

            migrationBuilder.InsertData(
                table: "system_users",
                columns: new[] { "id", "created_at", "display_name", "is_active", "last_login_at", "password_hash", "role", "username" },
                values: new object[,]
                {
                    { "su-001", new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), "管理员", true, null, "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=", "Admin", "admin" },
                    { "su-002", new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), "操作员1", true, null, "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=", "Operator", "operator1" }
                });
        }
    }
}
