using MES.Domain.Entities.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class SystemConfigConfiguration : IEntityTypeConfiguration<SystemConfig>
{
    public void Configure(EntityTypeBuilder<SystemConfig> entity)
    {
        entity.ToTable("system_configs");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.ConfigKey).HasColumnName("config_key").IsRequired().HasMaxLength(100);
        entity.Property(e => e.ConfigValue).HasColumnName("config_value").IsRequired().HasMaxLength(500);
        entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
        entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(100);
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        entity.Property(e => e.UpdatedBy).HasColumnName("updated_by").HasMaxLength(50);

        entity.HasIndex(e => e.ConfigKey).IsUnique();
    }
}
