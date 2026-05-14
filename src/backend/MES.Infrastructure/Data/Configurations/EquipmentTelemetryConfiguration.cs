using MES.Domain.Entities.Equipment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class EquipmentTelemetryConfiguration : IEntityTypeConfiguration<EquipmentTelemetry>
{
    public void Configure(EntityTypeBuilder<EquipmentTelemetry> entity)
    {
        entity.ToTable("equipment_telemetry");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.Parameters);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.Timestamp).HasColumnName("timestamp");
        entity.Property(e => e.ErrorCode).HasColumnName("error_code").HasMaxLength(50);
        entity.Property(e => e.ErrorMessage).HasColumnName("error_message").HasMaxLength(500);

        entity.HasIndex(e => e.EquipmentId);
        entity.HasIndex(e => e.Timestamp);
    }
}
