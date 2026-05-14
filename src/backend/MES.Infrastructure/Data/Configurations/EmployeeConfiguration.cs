using MES.Domain.Entities.Employee;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> entity)
    {
        entity.ToTable("employees");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.EmployeeNumber).HasColumnName("employee_number").IsRequired().HasMaxLength(50);
        entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
        entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(30);
        entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(200);
        entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50);
        entity.Property(e => e.Team).HasColumnName("team").HasMaxLength(100);
        entity.Property(e => e.Shift).HasColumnName("shift").HasMaxLength(50);
        entity.Property(e => e.IsActive).HasColumnName("is_active");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

        entity.HasIndex(e => e.EmployeeNumber).IsUnique();
        entity.HasIndex(e => e.Team);
        entity.HasIndex(e => e.Role);
    }
}
