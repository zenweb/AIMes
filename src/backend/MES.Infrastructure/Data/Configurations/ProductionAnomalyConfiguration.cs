using MES.Domain.Entities.Anomalies;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class ProductionAnomalyConfiguration : IEntityTypeConfiguration<ProductionAnomaly>
{
    public void Configure(EntityTypeBuilder<ProductionAnomaly> entity)
    {
        entity.ToTable("production_anomalies");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
        entity.OwnsOne(e => e.WorkOrderNumber, w => w.Property(x => x.Value).HasColumnName("work_order_number").IsRequired().HasMaxLength(50));
        entity.OwnsOne(e => e.OperationCode, o => o.Property(x => x.Value).HasColumnName("operation_code").IsRequired().HasMaxLength(50));
        entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").HasMaxLength(50);
        entity.Property(e => e.AnomalyType).HasColumnName("anomaly_type").HasMaxLength(100);
        entity.Property(e => e.Severity).HasColumnName("severity").HasConversion<string>();
        entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200);
        entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
        entity.Property(e => e.DetectedAt).HasColumnName("detected_at");
        entity.Property(e => e.DetectedBy).HasColumnName("detected_by").HasMaxLength(100);
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.RootCause).HasColumnName("root_cause").HasMaxLength(1000);
        entity.Property(e => e.Resolution).HasColumnName("resolution").HasMaxLength(1000);
        entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
        entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by").HasMaxLength(100);
        entity.OwnsMany(e => e.Responses, response =>
        {
            response.ToTable("anomaly_responses");
            response.WithOwner().HasForeignKey("anomaly_id");
            response.HasKey(e => e.Id);
            response.Property(e => e.Id).HasColumnName("id");
            response.Property(e => e.ResponseType).HasColumnName("response_type").HasConversion<string>();
            response.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
            response.Property(e => e.SuggestedAction).HasColumnName("suggested_action").HasMaxLength(1000);
            response.Property(e => e.SuggestedBy).HasColumnName("suggested_by").HasMaxLength(100);
            response.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            response.Property(e => e.ExecutedAt).HasColumnName("executed_at");
            response.Property(e => e.ExecutedBy).HasColumnName("executed_by").HasMaxLength(100);
            response.Property(e => e.CreatedAt).HasColumnName("created_at");
            response.OwnsOne(e => e.AiDecisionTrace, trace =>
            {
                trace.Property(e => e.TraceId).HasColumnName("ai_trace_id").HasMaxLength(100);
                trace.Property(e => e.AgentName).HasColumnName("ai_agent_name").HasMaxLength(100);
                trace.Property(e => e.AgentVersion).HasColumnName("ai_agent_version").HasMaxLength(50);
                trace.Property(e => e.ModelProvider).HasColumnName("ai_model_provider").HasMaxLength(50);
                trace.Property(e => e.ModelName).HasColumnName("ai_model_name").HasMaxLength(100);
                trace.Property(e => e.ModelVersion).HasColumnName("ai_model_version").HasMaxLength(50);
                trace.Property(e => e.PromptHash).HasColumnName("ai_prompt_hash").HasMaxLength(100);
                trace.Property(e => e.ContextHash).HasColumnName("ai_context_hash").HasMaxLength(100);
                trace.Property(e => e.InputSummary).HasColumnName("ai_input_summary");
                trace.Property(e => e.OutputSummary).HasColumnName("ai_output_summary");
                trace.Property(e => e.Confidence).HasColumnName("ai_confidence").HasColumnType("decimal(3,2)");
                trace.Property(e => e.TokensInput).HasColumnName("ai_tokens_input");
                trace.Property(e => e.TokensOutput).HasColumnName("ai_tokens_output");
                trace.Property(e => e.LatencyMs).HasColumnName("ai_latency_ms");
                trace.Property(e => e.HumanAdoptionStatus).HasColumnName("ai_human_adoption_status").HasConversion<string>();
                trace.Property(e => e.SourceReferences).HasColumnName("ai_source_references");
                trace.Property(e => e.RelatedBusinessKeys).HasColumnName("ai_related_business_keys");
                trace.Property(e => e.CreatedAt).HasColumnName("ai_created_at");
            });
        });
    }
}
