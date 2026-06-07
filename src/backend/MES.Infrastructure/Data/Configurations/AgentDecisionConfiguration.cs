using MES.Domain.Entities.Agent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AgentDecisionConfiguration : IEntityTypeConfiguration<AgentDecision>
{
    public void Configure(EntityTypeBuilder<AgentDecision> entity)
    {
        entity.ToTable("agent_decisions");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.TriggerEventId).HasColumnName("trigger_event_id").IsRequired().HasMaxLength(100);
        entity.Property(e => e.BoundedContext).HasColumnName("bounded_context").IsRequired().HasMaxLength(80);
        entity.Property(e => e.DecisionType).HasColumnName("decision_type").IsRequired().HasMaxLength(80);
        entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ScenarioCount).HasColumnName("scenario_count");
        entity.Property(e => e.RecommendedScenarioId).HasColumnName("recommended_scenario_id").HasMaxLength(100);
        entity.Property(e => e.AdoptedScenarioId).HasColumnName("adopted_scenario_id").HasMaxLength(100);
        entity.Property(e => e.AdoptionReason).HasColumnName("adoption_reason").HasMaxLength(1000);
        entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason").HasMaxLength(1000);
        entity.Property(e => e.AgentName).HasColumnName("agent_name").HasMaxLength(100);
        entity.Property(e => e.AgentVersion).HasColumnName("agent_version").HasMaxLength(50);
        entity.Property(e => e.TraceId).HasColumnName("trace_id").HasMaxLength(100);
        entity.Property(e => e.PromptHash).HasColumnName("prompt_hash").HasMaxLength(100);
        entity.Property(e => e.ContextHash).HasColumnName("context_hash").HasMaxLength(100);
        entity.Property(e => e.InputSummary).HasColumnName("input_summary");
        entity.Property(e => e.OutputSummary).HasColumnName("output_summary");
        entity.Property(e => e.BusinessKey).HasColumnName("business_key").HasMaxLength(200);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasMany(e => e.Scenarios)
            .WithOne(e => e.AgentDecision)
            .HasForeignKey(e => e.AgentDecisionId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.BoundedContext);
        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.BusinessKey);
        entity.HasIndex(e => e.CreatedAt);
    }
}
