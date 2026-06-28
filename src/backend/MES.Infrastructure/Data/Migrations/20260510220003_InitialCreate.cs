using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    session_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SourceDocumentIds = table.Column<List<string>>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_chunks",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    Metadata = table.Column<Dictionary<string, string>>(type: "hstore", nullable: false),
                    vector = table.Column<float[]>(type: "real[]", nullable: false),
                    source = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_chunks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "equipment",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    equipment_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    equipment_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    equipment_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    workshop_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    workshop_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    capacity = table.Column<double>(type: "double precision", nullable: false),
                    utilization_rate = table.Column<double>(type: "double precision", nullable: false),
                    last_maintenance_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_maintenance_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    current_work_order_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Parameters = table.Column<Dictionary<string, string>>(type: "hstore", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipment", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "equipment_telemetry",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    equipment_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    error_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipment_telemetry", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_records",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    equipment_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    maintenance_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    performed_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SparePartsUsed = table.Column<List<string>>(type: "text[]", nullable: false),
                    result = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    cost = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_maintenance_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "materials",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    material_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    available_quantity = table.Column<int>(type: "integer", nullable: false),
                    reserved_quantity = table.Column<int>(type: "integer", nullable: false),
                    safety_stock = table.Column<int>(type: "integer", nullable: false),
                    storage_location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_materials", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "quality_inspections",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    work_order_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    product_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    process_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    inspection_point = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    inspection_quantity = table.Column<int>(type: "integer", nullable: false),
                    qualified_quantity = table.Column<int>(type: "integer", nullable: false),
                    defect_quantity = table.Column<int>(type: "integer", nullable: false),
                    result = table.Column<string>(type: "text", nullable: false),
                    inspector_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    inspected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quality_inspections", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "schedule_plans",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    plan_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    plan_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    plan_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    overall_utilization_rate = table.Column<double>(type: "double precision", nullable: false),
                    on_time_delivery_rate = table.Column<double>(type: "double precision", nullable: false),
                    optimization_notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "work_orders",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    product_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    product_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    planned_quantity = table.Column<int>(type: "integer", nullable: false),
                    completed_quantity = table.Column<int>(type: "integer", nullable: false),
                    planned_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    planned_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    actual_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    workshop_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    route_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "defect_records",
                columns: table => new
                {
                    QualityInspectionId = table.Column<string>(type: "text", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DefectType = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    AreaRatio = table.Column<double>(type: "double precision", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    CorrectiveAction = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_defect_records", x => new { x.QualityInspectionId, x.Id });
                    table.ForeignKey(
                        name: "FK_defect_records_quality_inspections_QualityInspectionId",
                        column: x => x.QualityInspectionId,
                        principalTable: "quality_inspections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "schedule_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    work_order_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    equipment_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    planned_start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    planned_end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false),
                    setup_time = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DependentItems = table.Column<List<string>>(type: "text[]", nullable: false),
                    SchedulePlanId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_schedule_items_schedule_plans_SchedulePlanId",
                        column: x => x.SchedulePlanId,
                        principalTable: "schedule_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                """
                INSERT INTO equipment (id, capacity, created_at, current_work_order_id, equipment_code, equipment_name, equipment_type, last_maintenance_date, next_maintenance_date, "Parameters", status, updated_at, utilization_rate, workshop_id, workshop_name)
                VALUES
                    ('eq-001', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-001', 'CNC加工中心1号', 'CNC', NULL, NULL, ''::hstore, 'Available', NULL, 0.0, 'ws-001', '精密加工车间'),
                    ('eq-002', 100.0, TIMESTAMPTZ '2024-01-01T00:00:00Z', '', 'CNC-002', 'CNC加工中心2号', 'CNC', NULL, NULL, ''::hstore, 'Available', NULL, 0.0, 'ws-001', '精密加工车间');
                """);

            migrationBuilder.InsertData(
                table: "materials",
                columns: new[] { "id", "available_quantity", "created_at", "expiry_date", "material_code", "material_name", "material_type", "reserved_quantity", "safety_stock", "storage_location", "unit", "updated_at" },
                values: new object[] { "mat-001", 1000, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "AL-6061", "铝合金6061", "原材料", 0, 100, "A-01-01", "KG", null });

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_session_id",
                table: "chat_messages",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_timestamp",
                table: "chat_messages",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_document_chunks_source",
                table: "document_chunks",
                column: "source");

            migrationBuilder.CreateIndex(
                name: "IX_equipment_equipment_code",
                table: "equipment",
                column: "equipment_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_equipment_status",
                table: "equipment",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_equipment_workshop_id",
                table: "equipment",
                column: "workshop_id");

            migrationBuilder.CreateIndex(
                name: "IX_equipment_telemetry_equipment_id",
                table: "equipment_telemetry",
                column: "equipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_equipment_telemetry_timestamp",
                table: "equipment_telemetry",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_maintenance_records_equipment_id",
                table: "maintenance_records",
                column: "equipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_materials_material_code",
                table: "materials",
                column: "material_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_quality_inspections_inspected_at",
                table: "quality_inspections",
                column: "inspected_at");

            migrationBuilder.CreateIndex(
                name: "IX_quality_inspections_product_code",
                table: "quality_inspections",
                column: "product_code");

            migrationBuilder.CreateIndex(
                name: "IX_quality_inspections_work_order_id",
                table: "quality_inspections",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_items_equipment_id",
                table: "schedule_items",
                column: "equipment_id");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_items_SchedulePlanId",
                table: "schedule_items",
                column: "SchedulePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_schedule_items_work_order_id",
                table: "schedule_items",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_order_number",
                table: "work_orders",
                column: "order_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_planned_start_date",
                table: "work_orders",
                column: "planned_start_date");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_status",
                table: "work_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_workshop_id",
                table: "work_orders",
                column: "workshop_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_messages");

            migrationBuilder.DropTable(
                name: "defect_records");

            migrationBuilder.DropTable(
                name: "document_chunks");

            migrationBuilder.DropTable(
                name: "equipment");

            migrationBuilder.DropTable(
                name: "equipment_telemetry");

            migrationBuilder.DropTable(
                name: "maintenance_records");

            migrationBuilder.DropTable(
                name: "materials");

            migrationBuilder.DropTable(
                name: "schedule_items");

            migrationBuilder.DropTable(
                name: "work_orders");

            migrationBuilder.DropTable(
                name: "quality_inspections");

            migrationBuilder.DropTable(
                name: "schedule_plans");
        }
    }
}
