using MES.Domain.Entities.Knowledge;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> entity)
    {
        entity.ToTable("chat_messages");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.SessionId).HasColumnName("session_id").IsRequired().HasMaxLength(50);
        entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(20);
        entity.Property(e => e.Content).HasColumnName("content").IsRequired();
        entity.Property(e => e.Timestamp).HasColumnName("timestamp");

        entity.HasIndex(e => e.SessionId);
        entity.HasIndex(e => e.Timestamp);
    }
}
