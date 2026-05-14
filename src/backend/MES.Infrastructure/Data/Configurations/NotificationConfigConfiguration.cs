using MES.Domain.Entities.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class NotificationConfigConfiguration : IEntityTypeConfiguration<NotificationConfig>
{
    public void Configure(EntityTypeBuilder<NotificationConfig> entity)
    {
        entity.ToTable("notification_configs");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Category).HasColumnName("category").IsRequired().HasMaxLength(50);
        entity.Property(e => e.Label).HasColumnName("label").IsRequired().HasMaxLength(100);
        entity.Property(e => e.Enabled).HasColumnName("enabled");
        entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
    }
}
