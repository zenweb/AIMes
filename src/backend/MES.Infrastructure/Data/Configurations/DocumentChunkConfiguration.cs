using MES.Domain.Entities.Knowledge;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class DocumentChunkConfiguration : IEntityTypeConfiguration<DocumentChunk>
{
    public void Configure(EntityTypeBuilder<DocumentChunk> entity)
    {
        entity.ToTable("document_chunks");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Content).HasColumnName("content").IsRequired();
        entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(500);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");

        entity.Ignore(e => e.Metadata);
        entity.Ignore(e => e.Vector);

        entity.HasIndex(e => e.Source);
    }
}
