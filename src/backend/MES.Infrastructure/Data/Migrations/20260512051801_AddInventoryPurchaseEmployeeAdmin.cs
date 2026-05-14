using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryPurchaseEmployeeAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "document_chunks");

            migrationBuilder.DropColumn(
                name: "vector",
                table: "document_chunks");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "old_values",
                table: "audit_logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "new_values",
                table: "audit_logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "source_references",
                table: "ai_decision_traces",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "related_business_keys",
                table: "ai_decision_traces",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "output_summary",
                table: "ai_decision_traces",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "input_summary",
                table: "ai_decision_traces",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "bills_of_material",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    bom_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    bom_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    product_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    product_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    bom_type = table.Column<string>(type: "text", nullable: false),
                    version = table.Column<string>(type: "text", nullable: false),
                    bom_version_status = table.Column<string>(type: "text", nullable: false),
                    effective_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expire_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bills_of_material", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    employee_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    team = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    shift = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "operation_executions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    work_order_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    operator_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    station_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    equipment_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    suspend_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    exception_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    completed_quantity = table.Column<int>(type: "integer", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    paused_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    failed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operation_executions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "operation_reports",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    work_order_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reported_quantity = table.Column<int>(type: "integer", nullable: false),
                    defect_quantity = table.Column<int>(type: "integer", nullable: false),
                    parameters = table.Column<string>(type: "text", nullable: false),
                    parameter_captured_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    inspection_result = table.Column<string>(type: "text", nullable: false),
                    reported_by = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reported_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operation_reports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "process_routes",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    route_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    route_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    product_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    product_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    version = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_lead_time_minutes = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_process_routes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "production_anomalies",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    work_order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    equipment_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    anomaly_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    detected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    detected_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    root_cause = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    resolution = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolved_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_anomalies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "purchase_orders",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    supplier_contact = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    order_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expected_delivery_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    remark = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_by = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "stock_transactions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    transaction_type = table.Column<string>(type: "text", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    balance_before = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    balance_after = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    reference_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    warehouse = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    @operator = table.Column<string>(name: "operator", type: "character varying(50)", maxLength: 50, nullable: true),
                    remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_transactions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_configs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    config_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    config_value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_configs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "bom_change_records",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    change_description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    changed_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    bom_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_change_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_bom_change_records_bills_of_material_bom_id",
                        column: x => x.bom_id,
                        principalTable: "bills_of_material",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bom_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    loss_rate = table.Column<decimal>(type: "numeric(8,4)", nullable: true),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    consumption_timing = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false),
                    bom_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_bom_items_bills_of_material_bom_id",
                        column: x => x.bom_id,
                        principalTable: "bills_of_material",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "operation_report_materials",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    operation_report_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operation_report_materials", x => x.id);
                    table.ForeignKey(
                        name: "FK_operation_report_materials_operation_reports_operation_repo~",
                        column: x => x.operation_report_id,
                        principalTable: "operation_reports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "routing_steps",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    step_sequence = table.Column<int>(type: "integer", nullable: false),
                    operation_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    workstation_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    standard_setup_minutes = table.Column<double>(type: "double precision", nullable: false),
                    standard_run_minutes_per_unit = table.Column<double>(type: "double precision", nullable: false),
                    equipment_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    inspection_required = table.Column<bool>(type: "boolean", nullable: false),
                    route_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_routing_steps", x => x.id);
                    table.ForeignKey(
                        name: "FK_routing_steps_process_routes_route_id",
                        column: x => x.route_id,
                        principalTable: "process_routes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "anomaly_responses",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    response_type = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    suggested_action = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    suggested_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    executed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    executed_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ai_trace_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_agent_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_agent_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ai_model_provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ai_model_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_model_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ai_prompt_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_context_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ai_input_summary = table.Column<string>(type: "text", nullable: true),
                    ai_output_summary = table.Column<string>(type: "text", nullable: true),
                    ai_confidence = table.Column<decimal>(type: "numeric(3,2)", nullable: true),
                    ai_tokens_input = table.Column<int>(type: "integer", nullable: true),
                    ai_tokens_output = table.Column<int>(type: "integer", nullable: true),
                    ai_latency_ms = table.Column<int>(type: "integer", nullable: true),
                    ai_human_adoption_status = table.Column<string>(type: "text", nullable: true),
                    ai_source_references = table.Column<string>(type: "text", nullable: true),
                    ai_related_business_keys = table.Column<string>(type: "text", nullable: true),
                    ai_created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    anomaly_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anomaly_responses", x => x.id);
                    table.ForeignKey(
                        name: "FK_anomaly_responses_production_anomalies_anomaly_id",
                        column: x => x.anomaly_id,
                        principalTable: "production_anomalies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_order_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    received_quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    expected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    remark = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    purchase_order_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_order_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_purchase_order_items_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bom_item_children",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    material_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    loss_rate = table.Column<decimal>(type: "numeric(8,4)", nullable: true),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    consumption_timing = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false),
                    parent_item_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_item_children", x => x.id);
                    table.ForeignKey(
                        name: "FK_bom_item_children_bom_items_parent_item_id",
                        column: x => x.parent_item_id,
                        principalTable: "bom_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "routing_step_parameters",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    parameter_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    parameter_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    default_value = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    upper_limit = table.Column<double>(type: "double precision", nullable: true),
                    lower_limit = table.Column<double>(type: "double precision", nullable: true),
                    is_mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    routing_step_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_routing_step_parameters", x => x.id);
                    table.ForeignKey(
                        name: "FK_routing_step_parameters_routing_steps_routing_step_id",
                        column: x => x.routing_step_id,
                        principalTable: "routing_steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "employees",
                columns: new[] { "id", "created_at", "email", "employee_number", "is_active", "name", "phone", "role", "shift", "team", "updated_at" },
                values: new object[,]
                {
                    { "emp-001", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "EMP-001", true, "张三", null, "Operator", "Day", "班组A", null },
                    { "emp-002", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "EMP-002", true, "李四", null, "Engineer", "Day", "班组A", null },
                    { "emp-003", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "EMP-003", true, "王五", null, "Lead", "Day", "班组A", null }
                });

            migrationBuilder.InsertData(
                table: "system_configs",
                columns: new[] { "id", "category", "config_key", "config_value", "description", "updated_at", "updated_by" },
                values: new object[,]
                {
                    { "sc-001", "基本设置", "site.name", "AIMes 制造执行系统", "站点名称", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin" },
                    { "sc-002", "排班设置", "shift.morning.start", "08:00", "早班开始时间", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin" },
                    { "sc-003", "排班设置", "shift.morning.end", "20:00", "早班结束时间", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin" }
                });

            migrationBuilder.InsertData(
                table: "system_users",
                columns: new[] { "id", "created_at", "display_name", "is_active", "last_login_at", "role", "username" },
                values: new object[,]
                {
                    { "su-001", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "管理员", true, null, "Admin", "admin" },
                    { "su-002", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "操作员1", true, null, "Operator", "operator1" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_anomaly_responses_anomaly_id",
                table: "anomaly_responses",
                column: "anomaly_id");

            migrationBuilder.CreateIndex(
                name: "IX_bills_of_material_bom_code",
                table: "bills_of_material",
                column: "bom_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bom_change_records_bom_id",
                table: "bom_change_records",
                column: "bom_id");

            migrationBuilder.CreateIndex(
                name: "IX_bom_item_children_parent_item_id",
                table: "bom_item_children",
                column: "parent_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_bom_items_bom_id",
                table: "bom_items",
                column: "bom_id");

            migrationBuilder.CreateIndex(
                name: "IX_employees_employee_number",
                table: "employees",
                column: "employee_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_employees_role",
                table: "employees",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "IX_employees_team",
                table: "employees",
                column: "team");

            migrationBuilder.CreateIndex(
                name: "IX_operation_executions_operation_code",
                table: "operation_executions",
                column: "operation_code");

            migrationBuilder.CreateIndex(
                name: "IX_operation_executions_status",
                table: "operation_executions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_operation_executions_work_order_id",
                table: "operation_executions",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_operation_report_materials_operation_report_id",
                table: "operation_report_materials",
                column: "operation_report_id");

            migrationBuilder.CreateIndex(
                name: "IX_operation_reports_operation_id",
                table: "operation_reports",
                column: "operation_id");

            migrationBuilder.CreateIndex(
                name: "IX_operation_reports_reported_at",
                table: "operation_reports",
                column: "reported_at");

            migrationBuilder.CreateIndex(
                name: "IX_operation_reports_work_order_id",
                table: "operation_reports",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_process_routes_route_code",
                table: "process_routes",
                column: "route_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_items_purchase_order_id",
                table: "purchase_order_items",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_order_number",
                table: "purchase_orders",
                column: "order_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_status",
                table: "purchase_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_supplier_name",
                table: "purchase_orders",
                column: "supplier_name");

            migrationBuilder.CreateIndex(
                name: "IX_routing_step_parameters_routing_step_id",
                table: "routing_step_parameters",
                column: "routing_step_id");

            migrationBuilder.CreateIndex(
                name: "IX_routing_steps_route_id",
                table: "routing_steps",
                column: "route_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transactions_created_at",
                table: "stock_transactions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transactions_material_code",
                table: "stock_transactions",
                column: "material_code");

            migrationBuilder.CreateIndex(
                name: "IX_stock_transactions_transaction_type",
                table: "stock_transactions",
                column: "transaction_type");

            migrationBuilder.CreateIndex(
                name: "IX_system_configs_config_key",
                table: "system_configs",
                column: "config_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_system_users_username",
                table: "system_users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "anomaly_responses");

            migrationBuilder.DropTable(
                name: "bom_change_records");

            migrationBuilder.DropTable(
                name: "bom_item_children");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "operation_executions");

            migrationBuilder.DropTable(
                name: "operation_report_materials");

            migrationBuilder.DropTable(
                name: "purchase_order_items");

            migrationBuilder.DropTable(
                name: "routing_step_parameters");

            migrationBuilder.DropTable(
                name: "stock_transactions");

            migrationBuilder.DropTable(
                name: "system_configs");

            migrationBuilder.DropTable(
                name: "system_users");

            migrationBuilder.DropTable(
                name: "production_anomalies");

            migrationBuilder.DropTable(
                name: "bom_items");

            migrationBuilder.DropTable(
                name: "operation_reports");

            migrationBuilder.DropTable(
                name: "purchase_orders");

            migrationBuilder.DropTable(
                name: "routing_steps");

            migrationBuilder.DropTable(
                name: "bills_of_material");

            migrationBuilder.DropTable(
                name: "process_routes");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:hstore", ",,");

            migrationBuilder.AddColumn<Dictionary<string, string>>(
                name: "Metadata",
                table: "document_chunks",
                type: "hstore",
                nullable: false);

            migrationBuilder.AddColumn<float[]>(
                name: "vector",
                table: "document_chunks",
                type: "real[]",
                nullable: false,
                defaultValue: new float[0]);

            migrationBuilder.AlterColumn<string>(
                name: "old_values",
                table: "audit_logs",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "new_values",
                table: "audit_logs",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "source_references",
                table: "ai_decision_traces",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "related_business_keys",
                table: "ai_decision_traces",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "output_summary",
                table: "ai_decision_traces",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "input_summary",
                table: "ai_decision_traces",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
