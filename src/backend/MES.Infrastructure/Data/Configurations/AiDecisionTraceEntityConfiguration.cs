using MES.Domain.Entities;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AiDecisionTraceEntityConfiguration : IEntityTypeConfiguration<AiDecisionTraceEntity>
{
    public void Configure(EntityTypeBuilder<AiDecisionTraceEntity> entity)
    {
        entity.ToTable("ai_decision_traces");
        entity.HasKey(e => e.TraceId);
        entity.Property(e => e.TraceId).HasColumnName("trace_id");
        entity.Property(e => e.AgentName).HasColumnName("agent_name").IsRequired().HasMaxLength(100);
        entity.Property(e => e.AgentVersion).HasColumnName("agent_version").HasMaxLength(50);
        entity.Property(e => e.ModelProvider).HasColumnName("model_provider").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ModelName).HasColumnName("model_name").IsRequired().HasMaxLength(100);
        entity.Property(e => e.ModelVersion).HasColumnName("model_version").HasMaxLength(50);
        entity.Property(e => e.PromptHash).HasColumnName("prompt_hash").HasMaxLength(100);
        entity.Property(e => e.ContextHash).HasColumnName("context_hash").HasMaxLength(100);
        entity.Property(e => e.InputSummary).HasColumnName("input_summary");
        entity.Property(e => e.OutputSummary).HasColumnName("output_summary");
        entity.Property(e => e.Confidence).HasColumnName("confidence").HasColumnType("decimal(3,2)");
        entity.Property(e => e.TokensInput).HasColumnName("tokens_input");
        entity.Property(e => e.TokensOutput).HasColumnName("tokens_output");
        entity.Property(e => e.LatencyMs).HasColumnName("latency_ms");
        entity.Property(e => e.HumanAdoptionStatus).HasColumnName("human_adoption_status").HasConversion<string>();
        entity.Property(e => e.SourceReferences).HasColumnName("source_references");
        entity.Property(e => e.RelatedBusinessKeys).HasColumnName("related_business_keys");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.AgentName);
        entity.HasIndex(e => e.CreatedAt);
    }
}
