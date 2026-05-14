using MES.Domain.Entities.Scheduling;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class ScheduleItemConfiguration : IEntityTypeConfiguration<ScheduleItem>
{
    public void Configure(EntityTypeBuilder<ScheduleItem> entity)
    {
        entity.ToTable("schedule_items");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.PlannedStartTime).HasColumnName("planned_start_time");
        entity.Property(e => e.PlannedEndTime).HasColumnName("planned_end_time");
        entity.Property(e => e.Sequence).HasColumnName("sequence");
        entity.Property(e => e.SetupTime).HasColumnName("setup_time").HasMaxLength(50);

        entity.HasIndex(e => e.WorkOrderId);
        entity.HasIndex(e => e.EquipmentId);
    }
}
