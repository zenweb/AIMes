using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using MES.Infrastructure.Data;

namespace MES.Tests.Integration;

public class TestDataSeedFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            db.Database.EnsureCreated();

            if (!db.Equipment.Any())
            {
                db.Equipment.AddRange(
                    new MES.Domain.Entities.Equipment.Equipment
                    {
                        Id = "eq-001",
                        EquipmentCode = "CNC-001",
                        EquipmentName = "CNC Machine 1",
                        EquipmentType = "CNC",
                        WorkshopId = "ws-001",
                        WorkshopName = "Workshop A",
                        Status = MES.Domain.Enums.EquipmentStatus.Available,
                        Capacity = 100,
                        CreatedAt = DateTime.UtcNow
                    },
                    new MES.Domain.Entities.Equipment.Equipment
                    {
                        Id = "eq-002",
                        EquipmentCode = "CNC-002",
                        EquipmentName = "CNC Machine 2",
                        EquipmentType = "CNC",
                        WorkshopId = "ws-001",
                        WorkshopName = "Workshop A",
                        Status = MES.Domain.Enums.EquipmentStatus.Running,
                        Capacity = 80,
                        CreatedAt = DateTime.UtcNow
                    }
                );
                db.SaveChanges();
            }

            next(app);
        };
    }
}
