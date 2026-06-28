using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminAuthAndConcurrencyBaseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "version",
                table: "purchase_orders");

            migrationBuilder.DropColumn(
                name: "version",
                table: "production_anomalies");

            migrationBuilder.DropColumn(
                name: "version",
                table: "operation_reports");

            migrationBuilder.DropColumn(
                name: "version",
                table: "operation_executions");

            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                table: "system_users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "schedule_plans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "business_key",
                table: "audit_logs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "context_hash",
                table: "audit_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "initiated_by",
                table: "audit_logs",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "prompt_hash",
                table: "audit_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "trace_id",
                table: "audit_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "business_key_type",
                table: "ai_decision_traces",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "business_key_value",
                table: "ai_decision_traces",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "linked_agent_decision_id",
                table: "ai_decision_traces",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "notification_configs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    enabled = table.Column<bool>(type: "boolean", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_configs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    token = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "schedule_adoption_feedbacks",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    schedule_plan_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    workshop_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    optimization_objective = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    original_assignments_json = table.Column<string>(type: "text", nullable: false),
                    modified_assignments_json = table.Column<string>(type: "text", nullable: false),
                    reason_category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reason_detail = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    moved_order_ids_json = table.Column<string>(type: "text", nullable: true),
                    operator_user = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ai_trace_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    initiated_by_agent = table.Column<bool>(type: "boolean", nullable: false),
                    agent_decision_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    agent_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_adoption_feedbacks", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "notification_configs",
                columns: new[] { "id", "category", "description", "enabled", "label" },
                values: new object[,]
                {
                    { "nc-001", "equipment", "设备运行/故障/离线状态变更通知", true, "设备状态" },
                    { "nc-002", "quality", "质量检验不合格/SPC 超限预警", true, "质量预警" },
                    { "nc-003", "production", "工单进度更新通知", true, "生产进度" },
                    { "nc-004", "anomaly", "生产异常/设备异常告警", true, "异常告警" },
                    { "nc-005", "inventory", "物料入库/出库/调拨/调整通知", true, "库存变更" },
                    { "nc-006", "purchase", "采购单提交/确认/收货/取消通知", true, "采购状态" }
                });

            migrationBuilder.UpdateData(
                table: "system_users",
                keyColumn: "id",
                keyValue: "su-001",
                column: "password_hash",
                value: "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=");

            migrationBuilder.UpdateData(
                table: "system_users",
                keyColumn: "id",
                keyValue: "su-002",
                column: "password_hash",
                value: "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_business_key",
                table: "audit_logs",
                column: "business_key");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_trace_id",
                table: "audit_logs",
                column: "trace_id");

            migrationBuilder.CreateIndex(
                name: "IX_ai_decision_traces_business_key_type_business_key_value",
                table: "ai_decision_traces",
                columns: new[] { "business_key_type", "business_key_value" });

            migrationBuilder.CreateIndex(
                name: "IX_ai_decision_traces_linked_agent_decision_id",
                table: "ai_decision_traces",
                column: "linked_agent_decision_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_expires_at",
                table: "refresh_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_username",
                table: "refresh_tokens",
                column: "username");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_adoption_feedbacks_agent_decision_id",
                table: "schedule_adoption_feedbacks",
                column: "agent_decision_id");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_adoption_feedbacks_created_at",
                table: "schedule_adoption_feedbacks",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_adoption_feedbacks_operator_user",
                table: "schedule_adoption_feedbacks",
                column: "operator_user");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_adoption_feedbacks_schedule_plan_id",
                table: "schedule_adoption_feedbacks",
                column: "schedule_plan_id");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_adoption_feedbacks_workshop_id",
                table: "schedule_adoption_feedbacks",
                column: "workshop_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification_configs");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "schedule_adoption_feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_business_key",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_trace_id",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "IX_ai_decision_traces_business_key_type_business_key_value",
                table: "ai_decision_traces");

            migrationBuilder.DropIndex(
                name: "IX_ai_decision_traces_linked_agent_decision_id",
                table: "ai_decision_traces");

            migrationBuilder.DropColumn(
                name: "password_hash",
                table: "system_users");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "schedule_plans");

            migrationBuilder.DropColumn(
                name: "business_key",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "context_hash",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "initiated_by",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "prompt_hash",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "trace_id",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "business_key_type",
                table: "ai_decision_traces");

            migrationBuilder.DropColumn(
                name: "business_key_value",
                table: "ai_decision_traces");

            migrationBuilder.DropColumn(
                name: "linked_agent_decision_id",
                table: "ai_decision_traces");

            migrationBuilder.AddColumn<long>(
                name: "version",
                table: "purchase_orders",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "version",
                table: "production_anomalies",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "version",
                table: "operation_reports",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "version",
                table: "operation_executions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
