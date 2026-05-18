using MES.Domain.Entities.Routing;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

public class ProcessRouteConfiguration : IEntityTypeConfiguration<ProcessRoute>
{
    public void Configure(EntityTypeBuilder<ProcessRoute> entity)
    {
        entity.ToTable("process_routes");
        entity.HasKey(e => e.Id);
        entity.Ignore(e => e.DomainEvents);
        entity.IgnoreAggregateVersionForDerivedStringVersion();
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
        entity.Property(e => e.RouteCode).HasColumnName("route_code").IsRequired().HasMaxLength(50);
        entity.Property(e => e.RouteName).HasColumnName("route_name").IsRequired().HasMaxLength(200);
        entity.Property(e => e.ProductName).HasColumnName("product_name").HasMaxLength(200);
        entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
        entity.Property(e => e.TotalLeadTimeMinutes).HasColumnName("total_lead_time_minutes");
        entity.OwnsOne(e => e.ProductCode, p => p.Property(x => x.Value).HasColumnName("product_code").IsRequired().HasMaxLength(50));

        entity.OwnsMany(e => e.Steps, step =>
        {
            step.ToTable("routing_steps");
            step.WithOwner().HasForeignKey("route_id");
            step.HasKey(e => e.Id);
            step.Property(e => e.Id).HasColumnName("id");
            step.Property(e => e.StepSequence).HasColumnName("step_sequence");
            step.OwnsOne(e => e.OperationCode, o => o.Property(x => x.Value).HasColumnName("operation_code").IsRequired().HasMaxLength(50));
            step.Property(e => e.OperationName).HasColumnName("operation_name").HasMaxLength(200);
            step.Property(e => e.WorkstationType).HasColumnName("workstation_type").HasMaxLength(100);
            step.Property(e => e.StandardSetupMinutes).HasColumnName("standard_setup_minutes");
            step.Property(e => e.StandardRunMinutesPerUnit).HasColumnName("standard_run_minutes_per_unit");
            step.Property(e => e.EquipmentType).HasColumnName("equipment_type").HasMaxLength(100);
            step.Property(e => e.InspectionRequired).HasColumnName("inspection_required");
            step.OwnsMany(e => e.Parameters, parameter =>
            {
                parameter.ToTable("routing_step_parameters");
                parameter.WithOwner().HasForeignKey("routing_step_id");
                parameter.Property<string>("Id").HasColumnName("id");
                parameter.HasKey("Id");
                parameter.Property(e => e.ParameterCode).HasColumnName("parameter_code").HasMaxLength(50);
                parameter.Property(e => e.ParameterName).HasColumnName("parameter_name").HasMaxLength(100);
                parameter.Property(e => e.DefaultValue).HasColumnName("default_value").HasMaxLength(200);
                parameter.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                parameter.Property(e => e.UpperLimit).HasColumnName("upper_limit");
                parameter.Property(e => e.LowerLimit).HasColumnName("lower_limit");
                parameter.Property(e => e.IsMandatory).HasColumnName("is_mandatory");
            });
        });

        entity.HasIndex(e => e.RouteCode).IsUnique();
    }
}
