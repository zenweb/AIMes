using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Routing;
using MES.Domain.Primitives;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MES.Infrastructure.Data.Configurations;

internal static class ConcurrencyConfigurationExtensions
{
    public static void UseProviderConcurrencyToken<T>(this EntityTypeBuilder<T> entity)
        where T : AggregateRoot
    {
        var provider = DatabaseProvider.Resolve(Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER"));
        var version = entity.Property(e => e.Version);

        if (DatabaseProvider.IsPostgreSql(provider))
        {
            version
                .HasColumnName("xmin")
                .HasColumnType("xid")
                .ValueGeneratedOnAddOrUpdate()
                .IsConcurrencyToken();
            return;
        }

        version
            .HasColumnName("version")
            .HasColumnType("bigint")
            .HasDefaultValue(0u)
            .IsConcurrencyToken();
    }

    public static void UseProviderShadowConcurrencyToken<T>(this EntityTypeBuilder<T> entity)
        where T : class
    {
        var provider = DatabaseProvider.Resolve(Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER"));
        var version = entity.Property<uint>("version");

        if (DatabaseProvider.IsPostgreSql(provider))
        {
            version
                .HasColumnName("xmin")
                .HasColumnType("xid")
                .ValueGeneratedOnAddOrUpdate()
                .IsConcurrencyToken();
            return;
        }

        version
            .HasColumnName("version")
            .HasColumnType("bigint")
            .HasDefaultValue(0u)
            .IsConcurrencyToken();
    }

    public static void IgnoreAggregateVersionForDerivedStringVersion(
        this EntityTypeBuilder<BillOfMaterial> entity) =>
        entity.Ignore(nameof(AggregateRoot.Version));

    public static void IgnoreAggregateVersionForDerivedStringVersion(
        this EntityTypeBuilder<ProcessRoute> entity) =>
        entity.Ignore(nameof(AggregateRoot.Version));
}
