using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(MesDbContext))]
    [Migration("20260531120000_AddCoreCompositeIndexesAndJsonb")]
    public partial class AddCoreCompositeIndexesAndJsonb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "original_assignments_json",
                table: "schedule_adoption_feedbacks",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "modified_assignments_json",
                table: "schedule_adoption_feedbacks",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "moved_order_ids_json",
                table: "schedule_adoption_feedbacks",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_status_workshop_id_product_code_planned_start_date_planned_end_date",
                table: "work_orders",
                columns: new[] { "status", "workshop_id", "product_code", "planned_start_date", "planned_end_date" });

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_workshop_id_priority_planned_start_date",
                table: "work_orders",
                columns: new[] { "workshop_id", "priority", "planned_start_date" });

            migrationBuilder.CreateIndex(
                name: "IX_quality_inspections_work_order_id_inspected_at",
                table: "quality_inspections",
                columns: new[] { "work_order_id", "inspected_at" });

            migrationBuilder.CreateIndex(
                name: "IX_quality_inspections_product_code_inspected_at",
                table: "quality_inspections",
                columns: new[] { "product_code", "inspected_at" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_transactions_material_code_created_at",
                table: "stock_transactions",
                columns: new[] { "material_code", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_work_orders_status_workshop_id_product_code_planned_start_date_planned_end_date",
                table: "work_orders");

            migrationBuilder.DropIndex(
                name: "IX_work_orders_workshop_id_priority_planned_start_date",
                table: "work_orders");

            migrationBuilder.DropIndex(
                name: "IX_quality_inspections_work_order_id_inspected_at",
                table: "quality_inspections");

            migrationBuilder.DropIndex(
                name: "IX_quality_inspections_product_code_inspected_at",
                table: "quality_inspections");

            migrationBuilder.DropIndex(
                name: "IX_stock_transactions_material_code_created_at",
                table: "stock_transactions");

            migrationBuilder.AlterColumn<string>(
                name: "original_assignments_json",
                table: "schedule_adoption_feedbacks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<string>(
                name: "modified_assignments_json",
                table: "schedule_adoption_feedbacks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<string>(
                name: "moved_order_ids_json",
                table: "schedule_adoption_feedbacks",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);
        }
    }
}
