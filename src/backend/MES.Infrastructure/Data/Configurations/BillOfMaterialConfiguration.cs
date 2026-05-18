using MES.Domain.Entities.Bom;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class BillOfMaterialConfiguration : IEntityTypeConfiguration<BillOfMaterial>
{
    public void Configure(EntityTypeBuilder<BillOfMaterial> entity)
    {
        entity.ToTable("bills_of_material");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.IgnoreAggregateVersionForDerivedStringVersion();
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
        entity.Property(e => e.BomCode).HasColumnName("bom_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.BomName).HasColumnName("bom_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.ProductName).HasColumnName("product_name").HasMaxLength(200);
        entity.Property(e => e.BomType).HasColumnName("bom_type").HasConversion<string>();
        entity.Property(e => e.BomVersionStatus).HasColumnName("bom_version_status").HasConversion<string>();
        entity.Property(e => e.EffectiveDate).HasColumnName("effective_date");
        entity.Property(e => e.ExpireDate).HasColumnName("expire_date");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        entity.OwnsOne(e => e.ProductCode, p =>
        {
            p.Property(x => x.Value).HasColumnName("product_code").IsRequired().HasMaxLength(50);
        });

        entity.OwnsMany(e => e.Items, item =>
        {
            item.ToTable("bom_items");
            item.WithOwner().HasForeignKey("bom_id");
            item.HasKey(e => e.Id);
            item.Property(e => e.Id).HasColumnName("id");
            item.OwnsOne(e => e.MaterialCode, m => m.Property(x => x.Value).HasColumnName("material_code").IsRequired().HasMaxLength(50));
            item.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
            item.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
            item.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
            item.Property(e => e.LossRate).HasColumnName("loss_rate").HasColumnType("decimal(8,4)");
            item.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
            item.Property(e => e.ConsumptionTiming).HasColumnName("consumption_timing").HasMaxLength(100);
            item.Property(e => e.Sequence).HasColumnName("sequence");
            item.OwnsMany(e => e.Children, child =>
            {
                child.ToTable("bom_item_children");
                child.WithOwner().HasForeignKey("parent_item_id");
                child.HasKey(e => e.Id);
                child.Property(e => e.Id).HasColumnName("id");
                child.OwnsOne(e => e.MaterialCode, m => m.Property(x => x.Value).HasColumnName("material_code").IsRequired().HasMaxLength(50));
                child.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
                child.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
                child.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                child.Property(e => e.LossRate).HasColumnName("loss_rate").HasColumnType("decimal(8,4)");
                child.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
                child.Property(e => e.ConsumptionTiming).HasColumnName("consumption_timing").HasMaxLength(100);
                child.Property(e => e.Sequence).HasColumnName("sequence");
            });
        });

        entity.OwnsMany(e => e.ChangeHistory, change =>
        {
            change.ToTable("bom_change_records");
            change.WithOwner().HasForeignKey("bom_id");
            change.HasKey(e => e.Id);
            change.Property(e => e.Id).HasColumnName("id");
            change.Property(e => e.ChangeDescription).HasColumnName("change_description").HasMaxLength(1000);
            change.Property(e => e.ChangedBy).HasColumnName("changed_by").HasMaxLength(100);
            change.Property(e => e.ChangedAt).HasColumnName("changed_at");
        });

        entity.HasIndex(e => e.BomCode).IsUnique();
    }
}
