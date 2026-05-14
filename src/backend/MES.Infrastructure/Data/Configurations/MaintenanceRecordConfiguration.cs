using MES.Domain.Entities.Equipment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class MaintenanceRecordConfiguration : IEntityTypeConfiguration<MaintenanceRecord>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecord> entity)
    {
        entity.ToTable("maintenance_records");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.MaintenanceType).HasColumnName("maintenance_type").HasMaxLength(50);
        entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
        entity.Property(e => e.StartTime).HasColumnName("start_time");
        entity.Property(e => e.EndTime).HasColumnName("end_time");
        entity.Property(e => e.PerformedBy).HasColumnName("performed_by").HasMaxLength(100);
        entity.Property(e => e.Result).HasColumnName("result").HasMaxLength(500);
        entity.Property(e => e.Cost).HasColumnName("cost");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.EquipmentId);
    }
}
