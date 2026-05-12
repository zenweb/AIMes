using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MES.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAiDecisionTrace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ai_decision_traces",
                columns: table => new
                {
                    trace_id = table.Column<string>(type: "text", nullable: false),
                    agent_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    agent_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    model_provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    model_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    model_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    prompt_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    context_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    input_summary = table.Column<string>(type: "jsonb", nullable: true),
                    output_summary = table.Column<string>(type: "jsonb", nullable: true),
                    confidence = table.Column<decimal>(type: "numeric(3,2)", nullable: true),
                    tokens_input = table.Column<int>(type: "integer", nullable: true),
                    tokens_output = table.Column<int>(type: "integer", nullable: true),
                    latency_ms = table.Column<int>(type: "integer", nullable: false),
                    human_adoption_status = table.Column<string>(type: "text", nullable: false),
                    source_references = table.Column<string>(type: "jsonb", nullable: true),
                    related_business_keys = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_decision_traces", x => x.trace_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ai_decision_traces_agent_name",
                table: "ai_decision_traces",
                column: "agent_name");

            migrationBuilder.CreateIndex(
                name: "IX_ai_decision_traces_created_at",
                table: "ai_decision_traces",
                column: "created_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_decision_traces");
        }
    }
}
