using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class OperationReportConfiguration : IEntityTypeConfiguration<OperationReport>
{
    public void Configure(EntityTypeBuilder<OperationReport> entity)
    {
        entity.ToTable("operation_reports");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version)
              .HasColumnName("xmin")
              .HasColumnType("xid")
              .ValueGeneratedOnAddOrUpdate()
              .IsConcurrencyToken();
        entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.OperationId).HasColumnName("operation_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ReportedQuantity).HasColumnName("reported_quantity");
        entity.Property(e => e.DefectQuantity).HasColumnName("defect_quantity");
        entity.Property(e => e.InspectionResult).HasColumnName("inspection_result").HasConversion<string>();
        entity.Property(e => e.ReportedBy).HasColumnName("reported_by").HasMaxLength(50);
        entity.Property(e => e.ReportedAt).HasColumnName("reported_at");
        entity.OwnsOne(e => e.ParameterSnapshot, snapshot =>
        {
            snapshot.Property(s => s.CapturedAt).HasColumnName("parameter_captured_at");
            snapshot.Property(s => s.Parameters)
                .HasColumnName("parameters")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new()
                );
        });
        entity.OwnsMany(e => e.MaterialConsumed, material =>
        {
            material.ToTable("operation_report_materials");
            material.WithOwner().HasForeignKey("operation_report_id");
            material.Property<int>("id");
            material.HasKey("id");
            material.Property(m => m.MaterialCode).HasColumnName("material_code").HasMaxLength(50);
            material.Property(m => m.Quantity).HasColumnName("quantity");
            material.Property(m => m.Unit).HasColumnName("unit").HasMaxLength(20);
            material.Property(m => m.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
        });
        entity.HasIndex(e => e.WorkOrderId);
        entity.HasIndex(e => e.OperationId);
        entity.HasIndex(e => e.ReportedAt);
    }
}
