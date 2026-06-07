using MES.Domain.Entities.Agent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AgentActionResultConfiguration : IEntityTypeConfiguration<AgentActionResult>
{
    public void Configure(EntityTypeBuilder<AgentActionResult> entity)
    {
        entity.ToTable("agent_action_results");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.AgentDecisionId).HasColumnName("agent_decision_id").IsRequired().HasMaxLength(100);
        entity.Property(e => e.ActionType).HasColumnName("action_type").IsRequired().HasMaxLength(80);
        entity.Property(e => e.ResultStatus).HasColumnName("result_status").IsRequired().HasMaxLength(80);
        entity.Property(e => e.Actor).HasColumnName("actor").IsRequired().HasMaxLength(100);
        entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(80);
        entity.Property(e => e.InitiatedBy).HasColumnName("initiated_by").HasMaxLength(40);
        entity.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(1000);
        entity.Property(e => e.ResultPayloadJson).HasColumnName("result_payload_json");
        entity.Property(e => e.AuditLogId).HasColumnName("audit_log_id").HasMaxLength(100);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.HasIndex(e => e.AgentDecisionId);
        entity.HasIndex(e => e.ActionType);
        entity.HasIndex(e => e.ResultStatus);
    }
}
