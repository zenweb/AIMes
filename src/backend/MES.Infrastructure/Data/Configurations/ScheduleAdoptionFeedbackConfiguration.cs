using MES.Domain.Entities.Scheduling;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class ScheduleAdoptionFeedbackConfiguration : IEntityTypeConfiguration<ScheduleAdoptionFeedback>
{
    public void Configure(EntityTypeBuilder<ScheduleAdoptionFeedback> entity)
    {
        entity.ToTable("schedule_adoption_feedbacks");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.SchedulePlanId).HasColumnName("schedule_plan_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.WorkshopId).HasColumnName("workshop_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.OptimizationObjective).HasColumnName("optimization_objective").HasMaxLength(50);
        entity.Property(e => e.OriginalAssignmentsJson).HasColumnName("original_assignments_json").HasColumnType("jsonb");
        entity.Property(e => e.ModifiedAssignmentsJson).HasColumnName("modified_assignments_json").HasColumnType("jsonb");
        entity.Property(e => e.ReasonCategory).HasColumnName("reason_category").HasConversion<string>().HasMaxLength(50);
        entity.Property(e => e.ReasonDetail).HasColumnName("reason_detail").HasMaxLength(1000);
        entity.Property(e => e.MovedOrderIdsJson).HasColumnName("moved_order_ids_json").HasColumnType("jsonb");
        entity.Property(e => e.OperatorUser).HasColumnName("operator_user").IsRequired().HasMaxLength(100);
        entity.Property(e => e.AiTraceId).HasColumnName("ai_trace_id").HasMaxLength(100);
        entity.Property(e => e.InitiatedByAgent).HasColumnName("initiated_by_agent");
        entity.Property(e => e.AgentDecisionId).HasColumnName("agent_decision_id").HasMaxLength(100);
        entity.Property(e => e.AgentVersion).HasColumnName("agent_version").HasMaxLength(50);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.SchedulePlanId);
        entity.HasIndex(e => e.WorkshopId);
        entity.HasIndex(e => e.OperatorUser);
        entity.HasIndex(e => e.AgentDecisionId);
        entity.HasIndex(e => e.CreatedAt);
    }
}
