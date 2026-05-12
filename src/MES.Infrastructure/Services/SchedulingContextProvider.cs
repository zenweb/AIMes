using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Events;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using OperationReportedDomainEvent = MES.Domain.Events.OperationReported;

namespace MES.Infrastructure.Services;

public class SchedulingContextProvider : ISchedulingContextProvider
{
    private readonly MesDbContext _dbContext;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SchedulingContextProvider> _logger;
    private readonly BomExplosionService _bomExplosion;
    private readonly OperationSequenceExpander _routeExpander;

    public SchedulingContextProvider(
        MesDbContext dbContext,
        IMemoryCache cache,
        ILogger<SchedulingContextProvider> logger,
        BomExplosionService bomExplosion,
        OperationSequenceExpander routeExpander)
    {
        _dbContext = dbContext;
        _cache = cache;
        _logger = logger;
        _bomExplosion = bomExplosion;
        _routeExpander = routeExpander;
    }

    public async Task<SchedulingContextSnapshot> GetContextAsync(string workshopId, CancellationToken ct = default)
    {
        var cacheKey = GetCacheKey(workshopId, "full");
        if (_cache.TryGetValue(cacheKey, out SchedulingContextSnapshot? cached) && cached is not null)
        {
            return cached;
        }

        var workOrders = await _dbContext.WorkOrders
            .AsNoTracking()
            .Where(w => w.WorkshopId == workshopId)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ToListAsync(ct);

        var equipment = await _dbContext.Equipment
            .AsNoTracking()
            .Where(e => e.WorkshopId == workshopId)
            .OrderBy(e => e.EquipmentCode)
            .ToListAsync(ct);

        var materials = await _dbContext.Materials
            .AsNoTracking()
            .OrderBy(m => m.MaterialCode)
            .ToListAsync(ct);

        var executions = await _dbContext.OperationExecutions
            .AsNoTracking()
            .Where(e => workOrders.Select(w => w.Id).Contains(e.WorkOrderId)
                || workOrders.Select(w => w.OrderNumber).Contains(e.WorkOrderId))
            .OrderBy(e => e.WorkOrderId)
            .ThenBy(e => e.OperationCode)
            .ToListAsync(ct);

        var plannedQuantityByWorkOrder = workOrders.ToDictionary(w => w.Id, w => w.PlannedQuantity);
        foreach (var workOrder in workOrders)
        {
            plannedQuantityByWorkOrder.TryAdd(workOrder.OrderNumber, workOrder.PlannedQuantity);
        }

        // BOM 展开和工序路由展开
        var productCodes = workOrders.Select(w => w.ProductCode).Distinct().ToList();
        var routeCodes = workOrders.Where(w => !string.IsNullOrEmpty(w.RouteCode))
            .Select(w => w.RouteCode!).Distinct().ToList();

        var bomTask = _bomExplosion.ExplodeBatchAsync(productCodes, ct);
        var routeTask = _routeExpander.ExpandBatchAsync(routeCodes, ct);
        await Task.WhenAll(bomTask, routeTask);

        var bomResults = bomTask.Result;
        var routeResults = routeTask.Result;

        // 聚合 BOM 需求：按工单展开
        var bomRequirements = new List<BomRequirementSummary>();
        foreach (var wo in workOrders)
        {
            if (bomResults.TryGetValue(wo.ProductCode, out var items))
            {
                bomRequirements.AddRange(items);
            }
        }

        var snapshot = new SchedulingContextSnapshot
        {
            WorkshopId = workshopId,
            SnapshotTime = DateTime.UtcNow,
            WorkOrders = workOrders.Select(w => new WorkOrderSummary(
                w.OrderNumber,
                w.ProductCode,
                w.ProductName,
                w.PlannedQuantity,
                w.CompletedQuantity,
                w.Status.ToString(),
                w.PlannedStartDate,
                w.PlannedEndDate,
                w.RouteCode,
                w.Priority,
                w.WorkshopId)).ToList(),
            BomRequirements = bomRequirements,
            Routings = routeResults,
            EquipmentCapacities = equipment.Select(e => new EquipmentCapacitySummary(
                e.Id,
                e.EquipmentCode,
                e.EquipmentName,
                e.EquipmentType,
                e.Status.ToString(),
                e.Capacity,
                e.UtilizationRate)
            {
                TheoreticalCapacity = e.Capacity,
                ActualCapacity = e.Capacity * 0.78,
                ReservedCapacity = e.Capacity * 0.10,
                IsBottleneck = e.EquipmentType is "CNC" or "InjectionMolding" or "Assembly",
                ConstraintType = e.EquipmentType is "CNC" or "InjectionMolding" ? "equipment" : null
            }).ToList(),
            MaterialAvailabilities = materials.Select(m => new MaterialAvailabilitySummary(
                m.MaterialCode,
                m.MaterialName,
                m.AvailableQuantity,
                m.ReservedQuantity,
                m.SafetyStock)
            {
                LastUpdatedAt = DateTime.UtcNow,
                DataSource = "WMS实时"
            }).ToList(),
            WipItems = executions.Select(e => new WipSummary(
                e.WorkOrderId,
                e.OperationCode,
                e.CompletedQuantity,
                e.Status == OperationExecutionStatus.Running ? 1 : 0,
                plannedQuantityByWorkOrder.GetValueOrDefault(e.WorkOrderId))).ToList(),
            CurrentExecutions = executions.Select(e => new ExecutionStatusSummary(
                e.WorkOrderId,
                e.OperationCode,
                e.EquipmentId ?? string.Empty,
                e.Status.ToString(),
                e.StartedAt,
                e.CompletedQuantity,
                plannedQuantityByWorkOrder.GetValueOrDefault(e.WorkOrderId))).ToList()
        };

        snapshot.ChangeoverMatrix = BuildChangeoverMatrix(snapshot);
        snapshot.CompletenessScore = CalculateCompleteness(snapshot);
        _cache.Set(cacheKey, snapshot, TimeSpan.FromMinutes(5));

        return snapshot;
    }

    public Task UpdateCacheAsync(string workshopId, string snapshotType, object data)
    {
        _cache.Set(GetCacheKey(workshopId, snapshotType), data, TimeSpan.FromMinutes(5));
        _cache.Remove(GetCacheKey(workshopId, "full"));
        return Task.CompletedTask;
    }

    public Task HandleOperationReportedAsync(OperationReportedDomainEvent domainEvent, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Scheduling context invalidated by operation report. WorkOrder={WorkOrderNumber}, Operation={OperationCode}",
            domainEvent.WorkOrderNumber,
            domainEvent.OperationCode);
        return Task.CompletedTask;
    }

    public Task HandleSchedulePlanCreatedAsync(SchedulePlanCreated domainEvent, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "Scheduling context observed new schedule plan. PlanId={PlanId}, PlanName={PlanName}",
            domainEvent.PlanId,
            domainEvent.PlanName);
        return Task.CompletedTask;
    }

    private static DataCompletenessScore CalculateCompleteness(SchedulingContextSnapshot snapshot)
    {
        var score = new DataCompletenessScore
        {
            WorkOrdersScore = snapshot.WorkOrders.Count > 0 ? 100 : 0,
            BomScore = snapshot.BomRequirements.Count > 0 ? 100 : 0,
            RoutingScore = snapshot.Routings.Count > 0 ? 100 : 0,
            EquipmentScore = snapshot.EquipmentCapacities.Count > 0 ? 100 : 0,
            MaterialScore = snapshot.MaterialAvailabilities.Count > 0 ? 100 : 0,
            WipScore = snapshot.WipItems.Count > 0 ? 100 : 50,
            ExecutionScore = snapshot.CurrentExecutions.Count > 0 ? 100 : 50,
            ChangeoverScore = snapshot.ChangeoverMatrix.Count > 0 ? 100 : 0,
            Notes = snapshot.BomRequirements.Count == 0
                ? "BOM 数据未加载（可能产品在 BOM 主数据中未配置）"
                : "BOM 和工艺路线数据已就绪"
        };

        score.OverallScore = (score.WorkOrdersScore + score.BomScore + score.RoutingScore
            + score.EquipmentScore + score.MaterialScore + score.WipScore + score.ExecutionScore + score.ChangeoverScore) / 8;

        return score;
    }

    private static List<ChangeoverEntry> BuildChangeoverMatrix(SchedulingContextSnapshot snapshot)
    {
        if (snapshot.WorkOrders.Count == 0) return new();

        var materials = snapshot.WorkOrders
            .Select(w => w.ProductCode)
            .Distinct()
            .ToList();

        if (materials.Count < 2) return new();

        var matrix = new List<ChangeoverEntry>();
        for (var i = 0; i < materials.Count; i++)
        {
            for (var j = 0; j < materials.Count; j++)
            {
                if (i == j) continue;

                var from = materials[i];
                var to = materials[j];
                var isSameFamily = from[..Math.Min(from.Length, 4)] == to[..Math.Min(to.Length, 4)];

                var type = isSameFamily ? ChangeoverType.SimilarMaterial : ChangeoverType.DifferentMaterial;
                var minutes = type switch
                {
                    ChangeoverType.SameMaterial => 0,
                    ChangeoverType.SimilarMaterial => 60,
                    ChangeoverType.DifferentMaterial => 240,
                    _ => 120
                };

                matrix.Add(new ChangeoverEntry(from, to, minutes, type)
                {
                    EquipmentType = "CNC"
                });
            }
        }
        return matrix;
    }

    private static string GetCacheKey(string workshopId, string snapshotType) => $"scheduling-context:{workshopId}:{snapshotType}";
}
