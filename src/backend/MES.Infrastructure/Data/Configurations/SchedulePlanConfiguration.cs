using MES.Domain.Entities.Scheduling;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class SchedulePlanConfiguration : IEntityTypeConfiguration<SchedulePlan>
{
    public void Configure(EntityTypeBuilder<SchedulePlan> entity)
    {
        entity.ToTable("schedule_plans");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.UseProviderShadowConcurrencyToken();
        entity.Property(e => e.PlanName).HasColumnName("plan_name").HasMaxLength(200);
        entity.Property(e => e.PlanStartDate).HasColumnName("plan_start_date");
        entity.Property(e => e.PlanEndDate).HasColumnName("plan_end_date");
        entity.Property(e => e.OverallUtilizationRate).HasColumnName("overall_utilization_rate");
        entity.Property(e => e.OnTimeDeliveryRate).HasColumnName("on_time_delivery_rate");
        entity.Property(e => e.OptimizationNotes).HasColumnName("optimization_notes").HasMaxLength(1000);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey("SchedulePlanId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
