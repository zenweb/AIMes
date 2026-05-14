using MES.Domain.Entities.Purchase;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> entity)
    {
        entity.ToTable("purchase_orders");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
        entity.Property(e => e.OrderNumber).HasColumnName("order_number").IsRequired().HasMaxLength(50);
        entity.Property(e => e.SupplierName).HasColumnName("supplier_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.SupplierContact).HasColumnName("supplier_contact").HasMaxLength(100);
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.OrderDate).HasColumnName("order_date");
        entity.Property(e => e.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
        entity.Property(e => e.CompletedDate).HasColumnName("completed_date");
        entity.Ignore(e => e.TotalAmount);
        entity.Property(e => e.Remark).HasColumnName("remark").HasMaxLength(1000);
        entity.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(50);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey("purchase_order_id")
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.OrderNumber).IsUnique();
        entity.HasIndex(e => e.SupplierName);
        entity.HasIndex(e => e.Status);
    }
}

public class PurchaseOrderLineItemConfiguration : IEntityTypeConfiguration<PurchaseOrderLineItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLineItem> entity)
    {
        entity.ToTable("purchase_order_items");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.MaterialCode).HasColumnName("material_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
        entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
        entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
        entity.Property(e => e.ReceivedQuantity).HasColumnName("received_quantity").HasColumnType("decimal(18,4)");
        entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(18,4)");
        entity.Ignore(e => e.TotalPrice);
        entity.Property(e => e.ExpectedDate).HasColumnName("expected_date");
        entity.Property(e => e.Remark).HasColumnName("remark").HasMaxLength(500);
    }
}
