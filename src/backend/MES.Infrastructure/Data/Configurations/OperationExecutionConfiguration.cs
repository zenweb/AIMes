using MES.Domain.Entities.Production;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class OperationExecutionConfiguration : IEntityTypeConfiguration<OperationExecution>
{
    public void Configure(EntityTypeBuilder<OperationExecution> entity)
    {
        entity.ToTable("operation_executions");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
        entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.OperationCode).HasColumnName("operation_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.OperationName).HasColumnName("operation_name").HasMaxLength(200);
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.OperatorId).HasColumnName("operator_id").HasMaxLength(50);
        entity.Property(e => e.StationId).HasColumnName("station_id").HasMaxLength(50);
        entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").HasMaxLength(50);
        entity.Property(e => e.SuspendReason).HasColumnName("suspend_reason").HasMaxLength(500);
        entity.Property(e => e.ExceptionReason).HasColumnName("exception_reason").HasMaxLength(500);
        entity.Property(e => e.CompletedQuantity).HasColumnName("completed_quantity");
        entity.Property(e => e.StartedAt).HasColumnName("started_at");
        entity.Property(e => e.PausedAt).HasColumnName("paused_at");
        entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
        entity.Property(e => e.FailedAt).HasColumnName("failed_at");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        entity.HasIndex(e => e.WorkOrderId);
        entity.HasIndex(e => e.OperationCode);
        entity.HasIndex(e => e.Status);
    }
}
