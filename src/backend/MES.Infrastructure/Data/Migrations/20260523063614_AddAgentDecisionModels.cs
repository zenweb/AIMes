using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentDecisionModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "agent_action_results",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    agent_decision_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    action_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    result_status = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    actor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    role = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    initiated_by = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    result_payload_json = table.Column<string>(type: "text", nullable: false),
                    audit_log_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_action_results", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_decisions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    trigger_event_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    bounded_context = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    decision_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scenario_count = table.Column<int>(type: "integer", nullable: false),
                    recommended_scenario_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    adopted_scenario_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    adoption_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    agent_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    agent_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    trace_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    prompt_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    context_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    input_summary = table.Column<string>(type: "text", nullable: true),
                    output_summary = table.Column<string>(type: "text", nullable: true),
                    business_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_decisions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_evidence_links",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    agent_decision_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    evidence_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    evidence_key = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    evidence_summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_evidence_links", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_trigger_events",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    event_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    source_module = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    business_key_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    business_key_value = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    severity = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    payload_json = table.Column<string>(type: "text", nullable: false),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_trigger_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "agent_decision_scenarios",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    agent_decision_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    strategy_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    priority_rule = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    capacity_strategy = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    objective = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    tasks_json = table.Column<string>(type: "text", nullable: false),
                    otd_projection = table.Column<double>(type: "double precision", nullable: false),
                    utilization_projection = table.Column<double>(type: "double precision", nullable: false),
                    changeover_projection = table.Column<double>(type: "double precision", nullable: false),
                    explanation = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    sacrificed_objectives = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agent_decision_scenarios", x => x.id);
                    table.ForeignKey(
                        name: "FK_agent_decision_scenarios_agent_decisions_agent_decision_id",
                        column: x => x.agent_decision_id,
                        principalTable: "agent_decisions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_agent_action_results_action_type",
                table: "agent_action_results",
                column: "action_type");

            migrationBuilder.CreateIndex(
                name: "IX_agent_action_results_agent_decision_id",
                table: "agent_action_results",
                column: "agent_decision_id");

            migrationBuilder.CreateIndex(
                name: "IX_agent_action_results_result_status",
                table: "agent_action_results",
                column: "result_status");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decision_scenarios_agent_decision_id",
                table: "agent_decision_scenarios",
                column: "agent_decision_id");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decision_scenarios_strategy_name",
                table: "agent_decision_scenarios",
                column: "strategy_name");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decisions_bounded_context",
                table: "agent_decisions",
                column: "bounded_context");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decisions_business_key",
                table: "agent_decisions",
                column: "business_key");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decisions_created_at",
                table: "agent_decisions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_agent_decisions_status",
                table: "agent_decisions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_agent_evidence_links_agent_decision_id",
                table: "agent_evidence_links",
                column: "agent_decision_id");

            migrationBuilder.CreateIndex(
                name: "IX_agent_evidence_links_evidence_type_evidence_key",
                table: "agent_evidence_links",
                columns: new[] { "evidence_type", "evidence_key" });

            migrationBuilder.CreateIndex(
                name: "IX_agent_trigger_events_business_key_type_business_key_value",
                table: "agent_trigger_events",
                columns: new[] { "business_key_type", "business_key_value" });

            migrationBuilder.CreateIndex(
                name: "IX_agent_trigger_events_created_at",
                table: "agent_trigger_events",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_agent_trigger_events_event_type",
                table: "agent_trigger_events",
                column: "event_type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agent_action_results");

            migrationBuilder.DropTable(
                name: "agent_decision_scenarios");

            migrationBuilder.DropTable(
                name: "agent_evidence_links");

            migrationBuilder.DropTable(
                name: "agent_trigger_events");

            migrationBuilder.DropTable(
                name: "agent_decisions");
        }
    }
}
