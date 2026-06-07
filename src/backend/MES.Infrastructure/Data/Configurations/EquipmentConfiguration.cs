using MES.Domain.Entities.Equipment;
using MES.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class EquipmentConfiguration : IEntityTypeConfiguration<Equipment>
{
    public void Configure(EntityTypeBuilder<Equipment> entity)
    {
        entity.ToTable("equipment");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.Parameters);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.UseProviderShadowConcurrencyToken();
        entity.Property(e => e.EquipmentCode).HasColumnName("equipment_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.EquipmentName).HasColumnName("equipment_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.EquipmentType).HasColumnName("equipment_type").HasMaxLength(50);
        entity.Property(e => e.WorkshopId).HasColumnName("workshop_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.WorkshopName).HasColumnName("workshop_name").HasMaxLength(200);
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.Capacity).HasColumnName("capacity");
        entity.Property(e => e.UtilizationRate).HasColumnName("utilization_rate");
        entity.Property(e => e.LastMaintenanceDate).HasColumnName("last_maintenance_date");
        entity.Property(e => e.NextMaintenanceDate).HasColumnName("next_maintenance_date");
        entity.Property(e => e.CurrentWorkOrderId).HasColumnName("current_work_order_id").HasMaxLength(50);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasIndex(e => e.EquipmentCode).IsUnique();
        entity.HasIndex(e => e.WorkshopId);
        entity.HasIndex(e => e.Status);
    }
}
