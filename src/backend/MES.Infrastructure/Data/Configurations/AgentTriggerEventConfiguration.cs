using MES.Domain.Entities.Agent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AgentTriggerEventConfiguration : IEntityTypeConfiguration<AgentTriggerEvent>
{
    public void Configure(EntityTypeBuilder<AgentTriggerEvent> entity)
    {
        entity.ToTable("agent_trigger_events");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.EventType).HasColumnName("event_type").IsRequired().HasMaxLength(80);
        entity.Property(e => e.SourceModule).HasColumnName("source_module").IsRequired().HasMaxLength(80);
        entity.Property(e => e.BusinessKeyType).HasColumnName("business_key_type").HasMaxLength(80);
        entity.Property(e => e.BusinessKeyValue).HasColumnName("business_key_value").HasMaxLength(160);
        entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(30);
        entity.Property(e => e.PayloadJson).HasColumnName("payload_json");
        entity.Property(e => e.OccurredAt).HasColumnName("occurred_at");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.HasIndex(e => e.EventType);
        entity.HasIndex(e => new { e.BusinessKeyType, e.BusinessKeyValue });
        entity.HasIndex(e => e.CreatedAt);
    }
}
