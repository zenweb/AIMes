using MES.Domain.Entities.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> entity)
    {
        entity.ToTable("refresh_tokens");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Token).HasColumnName("token").IsRequired().HasMaxLength(128);
        entity.Property(e => e.Username).HasColumnName("username").IsRequired().HasMaxLength(100);
        entity.Property(e => e.Role).HasColumnName("role").IsRequired().HasMaxLength(50);
        entity.Property(e => e.DisplayName).HasColumnName("display_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.Token).IsUnique();
        entity.HasIndex(e => e.Username);
        entity.HasIndex(e => e.ExpiresAt);
    }
}
