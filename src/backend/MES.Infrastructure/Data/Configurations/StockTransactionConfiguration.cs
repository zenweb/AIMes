using MES.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class StockTransactionConfiguration : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(EntityTypeBuilder<StockTransaction> entity)
    {
        entity.ToTable("stock_transactions");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.MaterialCode).HasColumnName("material_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
        entity.Property(e => e.TransactionType).HasColumnName("transaction_type").HasConversion<string>();
        entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
        entity.Property(e => e.BalanceBefore).HasColumnName("balance_before").HasColumnType("decimal(18,4)");
        entity.Property(e => e.BalanceAfter).HasColumnName("balance_after").HasColumnType("decimal(18,4)");
        entity.Property(e => e.ReferenceType).HasColumnName("reference_type").HasMaxLength(50);
        entity.Property(e => e.ReferenceNumber).HasColumnName("reference_number").HasMaxLength(50);
        entity.Property(e => e.Warehouse).HasColumnName("warehouse").HasMaxLength(100);
        entity.Property(e => e.Location).HasColumnName("location").HasMaxLength(100);
        entity.Property(e => e.Operator).HasColumnName("operator").HasMaxLength(50);
        entity.Property(e => e.Remark).HasColumnName("remark").HasMaxLength(500);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.HasIndex(e => e.MaterialCode);
        entity.HasIndex(e => e.TransactionType);
        entity.HasIndex(e => e.CreatedAt);
        entity.HasIndex(e => new { e.MaterialCode, e.CreatedAt });
    }
}
