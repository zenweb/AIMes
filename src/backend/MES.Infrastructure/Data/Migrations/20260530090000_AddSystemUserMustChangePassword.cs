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
            migrationBuilder.Sql(
                """
                DELETE FROM system_users
                WHERE id IN ('su-001', 'su-002');
                """);

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

            migrationBuilder.Sql(
                """
                INSERT INTO system_users (id, created_at, display_name, is_active, last_login_at, password_hash, role, username)
                VALUES
                    ('su-001', TIMESTAMPTZ '2024-01-01T00:00:00Z', '管理员', TRUE, NULL, 'AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=', 'Admin', 'admin'),
                    ('su-002', TIMESTAMPTZ '2024-01-01T00:00:00Z', '操作员1', TRUE, NULL, 'AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=', 'Operator', 'operator1');
                """);
        }
    }
}
