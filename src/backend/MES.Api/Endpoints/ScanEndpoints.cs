using MES.Domain.Interfaces.Repositories;

namespace MES.Api.Endpoints;

public static class ScanEndpoints
{
    public static RouteGroupBuilder MapScanEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{code}", LookupByCodeAsync).WithTags("条码扫描");
        return group;
    }

    private static async Task<IResult> LookupByCodeAsync(
        string code,
        IWorkOrderRepository workOrderRepo,
        IMaterialRepository materialRepo,
        IEquipmentRepository equipmentRepo,
        CancellationToken ct)
    {
        var material = await materialRepo.GetByCodeAsync(code, ct);
        if (material != null)
        {
            return TypedResults.Ok(new
            {
                Type = "Material",
                Id = material.Id,
                Code = material.MaterialCode,
                Name = material.MaterialName,
                MaterialType = material.MaterialType,
                Available = material.NetAvailable,
                Unit = material.Unit,
                Location = material.StorageLocation,
            });
        }

        var equipment = await equipmentRepo.GetByCodeAsync(code, ct);
        if (equipment != null)
        {
            return TypedResults.Ok(new
            {
                Type = "Equipment",
                Id = equipment.Id,
                Code = equipment.EquipmentCode,
                Name = equipment.EquipmentName,
                EquipmentType = equipment.EquipmentType,
                Status = equipment.Status.ToString(),
                Workshop = equipment.WorkshopName,
            });
        }

        var workOrder = await workOrderRepo.GetByCodeAsync(code, ct);
        if (workOrder != null)
        {
            return TypedResults.Ok(new
            {
                Type = "WorkOrder",
                Id = workOrder.Id,
                OrderNumber = workOrder.OrderNumber,
                ProductCode = workOrder.ProductCode,
                ProductName = workOrder.ProductName,
                Status = workOrder.Status.ToString(),
                Quantity = workOrder.PlannedQuantity,
                Completed = workOrder.CompletedQuantity,
            });
        }

        return TypedResults.NotFound(new { Code = code, Message = "未找到匹配的物料、设备或工单" });
    }
}
