using MES.Domain.Entities.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class SystemUserConfiguration : IEntityTypeConfiguration<SystemUser>
{
    public void Configure(EntityTypeBuilder<SystemUser> entity)
    {
        entity.ToTable("system_users");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Username).HasColumnName("username").IsRequired().HasMaxLength(50);
        entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(100);
        entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50);
        entity.Property(e => e.IsActive).HasColumnName("is_active");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.PasswordHash).HasColumnName("password_hash").HasMaxLength(200);
        entity.Property(e => e.LastLoginAt).HasColumnName("last_login_at");

        entity.HasIndex(e => e.Username).IsUnique();
    }
}
