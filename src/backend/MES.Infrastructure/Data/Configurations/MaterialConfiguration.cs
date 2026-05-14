using MES.Domain.Entities.Production;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> entity)
    {
        entity.ToTable("materials");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.MaterialCode).HasColumnName("material_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.MaterialName).HasColumnName("material_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.MaterialType).HasColumnName("material_type").HasMaxLength(50);
        entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
        entity.Property(e => e.AvailableQuantity).HasColumnName("available_quantity");
        entity.Property(e => e.ReservedQuantity).HasColumnName("reserved_quantity");
        entity.Property(e => e.SafetyStock).HasColumnName("safety_stock");
        entity.Property(e => e.StorageLocation).HasColumnName("storage_location").HasMaxLength(100);
        entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasIndex(e => e.MaterialCode).IsUnique();
    }
}
