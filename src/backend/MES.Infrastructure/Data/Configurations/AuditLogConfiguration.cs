using MES.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> entity)
    {
        entity.ToTable("audit_logs");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired().HasMaxLength(100);
        entity.Property(e => e.InitiatedBy)
            .HasColumnName("initiated_by")
            .HasConversion<string>()
            .HasMaxLength(40);
        entity.Property(e => e.Action).HasColumnName("action").IsRequired().HasMaxLength(100);
        entity.Property(e => e.Resource).HasColumnName("resource").IsRequired().HasMaxLength(200);
        entity.Property(e => e.ResourceId).HasColumnName("resource_id").HasMaxLength(100);
        entity.Property(e => e.BusinessKey).HasColumnName("business_key").HasMaxLength(200);
        entity.Property(e => e.TraceId).HasColumnName("trace_id").HasMaxLength(100);
        entity.Property(e => e.PromptHash).HasColumnName("prompt_hash").HasMaxLength(100);
        entity.Property(e => e.ContextHash).HasColumnName("context_hash").HasMaxLength(100);
        entity.Property(e => e.OldValues).HasColumnName("old_values");
        entity.Property(e => e.NewValues).HasColumnName("new_values");
        entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(100);
        entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.UserId);
        entity.HasIndex(e => e.Resource);
        entity.HasIndex(e => e.ResourceId);
        entity.HasIndex(e => e.BusinessKey);
        entity.HasIndex(e => e.TraceId);
        entity.HasIndex(e => e.CreatedAt);
    }
}
