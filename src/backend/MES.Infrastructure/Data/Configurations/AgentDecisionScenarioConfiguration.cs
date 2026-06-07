using MES.Domain.Entities.Agent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AgentDecisionScenarioConfiguration : IEntityTypeConfiguration<AgentDecisionScenario>
{
    public void Configure(EntityTypeBuilder<AgentDecisionScenario> entity)
    {
        entity.ToTable("agent_decision_scenarios");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.AgentDecisionId).HasColumnName("agent_decision_id").IsRequired().HasMaxLength(100);
        entity.Property(e => e.StrategyName).HasColumnName("strategy_name").IsRequired().HasMaxLength(100);
        entity.Property(e => e.PriorityRule).HasColumnName("priority_rule").HasMaxLength(50);
        entity.Property(e => e.CapacityStrategy).HasColumnName("capacity_strategy").HasMaxLength(80);
        entity.Property(e => e.Objective).HasColumnName("objective").HasMaxLength(80);
        entity.Property(e => e.TasksJson).HasColumnName("tasks_json");
        entity.Property(e => e.OtdProjection).HasColumnName("otd_projection");
        entity.Property(e => e.UtilizationProjection).HasColumnName("utilization_projection");
        entity.Property(e => e.ChangeoverProjection).HasColumnName("changeover_projection");
        entity.Property(e => e.Explanation).HasColumnName("explanation").HasMaxLength(2000);
        entity.Property(e => e.SacrificedObjectives).HasColumnName("sacrificed_objectives").HasMaxLength(1000);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.HasIndex(e => e.AgentDecisionId);
        entity.HasIndex(e => e.StrategyName);
    }
}
