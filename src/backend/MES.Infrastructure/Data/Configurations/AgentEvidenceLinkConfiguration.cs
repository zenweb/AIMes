using MES.Domain.Entities.Agent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AgentEvidenceLinkConfiguration : IEntityTypeConfiguration<AgentEvidenceLink>
{
    public void Configure(EntityTypeBuilder<AgentEvidenceLink> entity)
    {
        entity.ToTable("agent_evidence_links");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.AgentDecisionId).HasColumnName("agent_decision_id").IsRequired().HasMaxLength(100);
        entity.Property(e => e.EvidenceType).HasColumnName("evidence_type").IsRequired().HasMaxLength(80);
        entity.Property(e => e.EvidenceKey).HasColumnName("evidence_key").IsRequired().HasMaxLength(160);
        entity.Property(e => e.EvidenceSummary).HasColumnName("evidence_summary");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.HasIndex(e => e.AgentDecisionId);
        entity.HasIndex(e => new { e.EvidenceType, e.EvidenceKey });
    }
}
