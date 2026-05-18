using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class WorkOrderConfiguration : IEntityTypeConfiguration<WorkOrder>
{
    public void Configure(EntityTypeBuilder<WorkOrder> entity)
    {
        entity.ToTable("work_orders");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.CustomFields);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.UseProviderShadowConcurrencyToken();
        entity.Property(e => e.OrderNumber).HasColumnName("order_number").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ProductCode).HasColumnName("product_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ProductName).HasColumnName("product_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.PlannedQuantity).HasColumnName("planned_quantity");
        entity.Property(e => e.CompletedQuantity).HasColumnName("completed_quantity");
        entity.Property(e => e.PlannedStartDate).HasColumnName("planned_start_date");
        entity.Property(e => e.PlannedEndDate).HasColumnName("planned_end_date");
        entity.Property(e => e.ActualStartDate).HasColumnName("actual_start_date");
        entity.Property(e => e.ActualEndDate).HasColumnName("actual_end_date");
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.WorkshopId).HasColumnName("workshop_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.RouteCode).HasColumnName("route_code").HasMaxLength(50);
        entity.Property(e => e.Priority).HasColumnName("priority");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasIndex(e => e.OrderNumber).IsUnique();
        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.WorkshopId);
        entity.HasIndex(e => e.PlannedStartDate);
    }
}
