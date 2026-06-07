using MES.Domain.Entities.Quality;
using MES.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class QualityInspectionConfiguration : IEntityTypeConfiguration<QualityInspection>
{
    public void Configure(EntityTypeBuilder<QualityInspection> entity)
    {
        entity.ToTable("quality_inspections");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.MeasurementData);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ProductCode).HasColumnName("product_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.ProcessName).HasColumnName("process_name").HasMaxLength(100);
        entity.Property(e => e.InspectionPoint).HasColumnName("inspection_point").HasMaxLength(100);
        entity.Property(e => e.InspectionQuantity).HasColumnName("inspection_quantity");
        entity.Property(e => e.QualifiedQuantity).HasColumnName("qualified_quantity");
        entity.Property(e => e.DefectQuantity).HasColumnName("defect_quantity");
        entity.Property(e => e.Result).HasColumnName("result").HasConversion<string>();
        entity.Property(e => e.InspectorId).HasColumnName("inspector_id").HasMaxLength(50);
        entity.Property(e => e.InspectedAt).HasColumnName("inspected_at");

        entity.HasIndex(e => e.WorkOrderId);
        entity.HasIndex(e => e.ProductCode);
        entity.HasIndex(e => e.InspectedAt);
        entity.HasIndex(e => new { e.WorkOrderId, e.InspectedAt });
        entity.HasIndex(e => new { e.ProductCode, e.InspectedAt });

        entity.OwnsMany(e => e.Defects, d =>
        {
            d.WithOwner();
            d.ToTable("defect_records");
        });
    }
}
