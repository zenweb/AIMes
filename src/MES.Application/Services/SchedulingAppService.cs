using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.AI.Pro.Agents;

namespace MES.Application.Services;

/// <summary>
/// 排产应用服务
/// </summary>
public interface ISchedulingAppService
{
    Task<SchedulingResultDto> OptimizeScheduleAsync(OptimizeScheduleRequest request, CancellationToken ct = default);
    Task<SchedulePlanDto?> GetCurrentPlanAsync(CancellationToken ct = default);
    Task<SchedulePlanDto?> GetPlanByIdAsync(string id, CancellationToken ct = default);
    Task<List<SchedulePlanDto>> GetAllPlansAsync(CancellationToken ct = default);
    Task<WorkOrderDto> CreateWorkOrderAsync(CreateWorkOrderRequest request, CancellationToken ct = default);
    Task<WorkOrderDto?> GetWorkOrderByIdAsync(string id, CancellationToken ct = default);
    Task<PagedResult<WorkOrderDto>> GetWorkOrdersAsync(WorkOrderQueryParameters parameters, CancellationToken ct = default);
    Task<WorkOrderDto> UpdateWorkOrderStatusAsync(string id, string status, CancellationToken ct = default);
    Task DeleteWorkOrderAsync(string id, CancellationToken ct = default);
    Task RecordAdoptionFeedbackAsync(AdoptionFeedbackRequest request, string operatorUser, CancellationToken ct = default);
    Task<BatchOptimizeResultDto> BatchOptimizeAsync(BatchOptimizeRequest request, CancellationToken ct = default);
}

/// <summary>
/// 排产应用服务实现
/// </summary>
public class SchedulingAppService : ISchedulingAppService
{
    private readonly IWorkOrderRepository _workOrderRepo;
    private readonly IEquipmentRepository _equipmentRepo;
    private readonly IMaterialRepository _materialRepo;
    private readonly IScheduleRepository _scheduleRepo;
    private readonly SchedulingAgent _schedulingAgent;
    private readonly AdoptionFeedbackService _feedbackService;

    public SchedulingAppService(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IMaterialRepository materialRepo,
        IScheduleRepository scheduleRepo,
        SchedulingAgent schedulingAgent,
        AdoptionFeedbackService feedbackService)
    {
        _workOrderRepo = workOrderRepo;
        _equipmentRepo = equipmentRepo;
        _materialRepo = materialRepo;
        _scheduleRepo = scheduleRepo;
        _schedulingAgent = schedulingAgent;
        _feedbackService = feedbackService;
    }

    public async Task<SchedulingResultDto> OptimizeScheduleAsync(OptimizeScheduleRequest request, CancellationToken ct = default)
    {
        // 1. 获取待排产工单
        var workOrders = await GetWorkOrdersForScheduling(request, ct);

        // 2. 获取设备产能
        var equipment = await _equipmentRepo.GetByWorkshopAsync(request.WorkshopId);

        // 3. 获取物料齐套情况
        var materialCodes = workOrders.SelectMany(w => GetMaterialCodesForProduct(w.ProductCode)).Distinct().ToList();
        var materials = await GetMaterialAvailability(materialCodes, ct);

        // 4. 构建排产请求
        var scheduleRequest = new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = workOrders.Select(MapToWorkOrderInfo).ToList(),
            Equipment = equipment.Select(MapToEquipmentCapacity).ToList(),
            Materials = materials,
            Deadlines = workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate),
            OptimizationObjective = request.OptimizationObjective,
            HistoricalData = request.ConsiderHistoricalData ? await GetHistoricalData(request.WorkshopId, ct) : null
        };

        // 5. 调用AI排产Agent
        var result = await _schedulingAgent.OptimizeScheduleAsync(scheduleRequest, ct);

        // 6. 保存排产计划
        var plan = MapToSchedulePlan(result, request);
        await _scheduleRepo.CreateAsync(plan);

        // 7. 返回结果
        return new SchedulingResultDto
        {
            Plan = MapToSchedulePlanDto(plan),
            Assignments = result.Assignments.Select(a => new ScheduleAssignmentDto
            {
                WorkOrderId = a.WorkOrderId,
                EquipmentId = a.EquipmentId,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Dependencies = a.Dependencies
            }).ToList(),
            EstimatedCompletionRate = result.UtilizationRate,
            UtilizationRate = result.UtilizationRate,
            OptimizationReason = result.OptimizationNotes
        };
    }

    public async Task<SchedulePlanDto?> GetCurrentPlanAsync(CancellationToken ct = default)
    {
        var plan = await _scheduleRepo.GetCurrentPlanAsync();
        return plan != null ? MapToSchedulePlanDto(plan) : null;
    }

    public async Task<SchedulePlanDto?> GetPlanByIdAsync(string id, CancellationToken ct = default)
    {
        var plan = await _scheduleRepo.GetByIdAsync(id);
        return plan != null ? MapToSchedulePlanDto(plan) : null;
    }

    public async Task<List<SchedulePlanDto>> GetAllPlansAsync(CancellationToken ct = default)
    {
        var plans = await _scheduleRepo.GetAllAsync();
        return plans.Select(MapToSchedulePlanDto).ToList();
    }

    public async Task<WorkOrderDto> CreateWorkOrderAsync(CreateWorkOrderRequest request, CancellationToken ct = default)
    {
        var workOrder = new WorkOrder
        {
            OrderNumber = request.OrderNumber,
            ProductCode = request.ProductCode,
            ProductName = request.ProductName,
            PlannedQuantity = request.PlannedQuantity,
            PlannedStartDate = request.PlannedStartDate,
            PlannedEndDate = request.PlannedEndDate,
            WorkshopId = request.WorkshopId,
            RouteCode = request.RouteCode ?? string.Empty,
            Priority = request.Priority,
            Status = WorkOrderStatus.Created
        };

        var created = await _workOrderRepo.CreateAsync(workOrder);
        return MapToWorkOrderDto(created);
    }

    public async Task<WorkOrderDto?> GetWorkOrderByIdAsync(string id, CancellationToken ct = default)
    {
        var workOrder = await _workOrderRepo.GetByIdAsync(id);
        return workOrder != null ? MapToWorkOrderDto(workOrder) : null;
    }

    public async Task<PagedResult<WorkOrderDto>> GetWorkOrdersAsync(WorkOrderQueryParameters parameters, CancellationToken ct = default)
    {
        WorkOrderStatus? status = null;
        if (!string.IsNullOrEmpty(parameters.Status) && Enum.TryParse<WorkOrderStatus>(parameters.Status, out var parsedStatus))
        {
            status = parsedStatus;
        }

        var workOrders = await _workOrderRepo.GetAllAsync(status);

        // 应用过滤
        var query = workOrders.AsQueryable();

        if (!string.IsNullOrEmpty(parameters.WorkshopId))
            query = query.Where(w => w.WorkshopId == parameters.WorkshopId);

        if (!string.IsNullOrEmpty(parameters.ProductCode))
            query = query.Where(w => w.ProductCode == parameters.ProductCode);

        if (parameters.StartDate.HasValue)
            query = query.Where(w => w.PlannedStartDate >= parameters.StartDate.Value);

        if (parameters.EndDate.HasValue)
            query = query.Where(w => w.PlannedEndDate <= parameters.EndDate.Value);

        // 分页
        var totalCount = query.Count();
        var items = query
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(MapToWorkOrderDto)
            .ToList();

        return new PagedResult<WorkOrderDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = parameters.Page,
            PageSize = parameters.PageSize
        };
    }

    public async Task<WorkOrderDto> UpdateWorkOrderStatusAsync(string id, string status, CancellationToken ct = default)
    {
        var workOrder = await _workOrderRepo.GetByIdAsync(id);
        if (workOrder == null)
            throw new InvalidOperationException($"工单 {id} 不存在");

        workOrder.Status = Enum.Parse<WorkOrderStatus>(status);
        var updated = await _workOrderRepo.UpdateAsync(workOrder);
        return MapToWorkOrderDto(updated);
    }

    public async Task DeleteWorkOrderAsync(string id, CancellationToken ct = default)
    {
        await _workOrderRepo.DeleteAsync(id);
    }

    public async Task<BatchOptimizeResultDto> BatchOptimizeAsync(BatchOptimizeRequest request, CancellationToken ct = default)
    {
        var objectives = request.Objectives ?? new List<string> { "due_date", "utilization", "changeover", "balanced" };

        var objectiveLabels = new Dictionary<string, string>
        {
            ["due_date"] = "交期优先",
            ["utilization"] = "利用率优先",
            ["changeover"] = "换线成本优先",
            ["balanced"] = "综合平衡",
        };

        // 共享数据：一次获取，多目标共用
        var workOrders = await GetWorkOrdersForScheduling(
            new OptimizeScheduleRequest { WorkshopId = request.WorkshopId, WorkOrderIds = request.WorkOrderIds }, ct);
        var equipment = await _equipmentRepo.GetByWorkshopAsync(request.WorkshopId);
        var materialCodes = workOrders.SelectMany(w => GetMaterialCodesForProduct(w.ProductCode)).Distinct().ToList();
        var materials = await GetMaterialAvailability(materialCodes, ct);

        var baseRequest = new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = workOrders.Select(MapToWorkOrderInfo).ToList(),
            Equipment = equipment.Select(MapToEquipmentCapacity).ToList(),
            Materials = materials,
            Deadlines = workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate),
        };

        // 各目标并行优化
        var tasks = objectives.Select(objective =>
        {
            var req = new ScheduleRequest
            {
                WorkshopId = baseRequest.WorkshopId,
                Orders = baseRequest.Orders,
                Equipment = baseRequest.Equipment,
                Materials = baseRequest.Materials,
                Deadlines = baseRequest.Deadlines,
                OptimizationObjective = objective,
            };
            return _schedulingAgent.OptimizeScheduleAsync(req, ct);
        });

        var results = await Task.WhenAll(tasks);
        var items = new List<ObjectiveCompareItemDto>();
        double bestScore = double.MinValue;
        string? bestObjective = null;

        for (int i = 0; i < objectives.Count && i < results.Length; i++)
        {
            var result = results[i];
            var objective = objectives[i];
            var plan = MapToSchedulePlanDto(MapToSchedulePlan(result, new OptimizeScheduleRequest { WorkshopId = request.WorkshopId }));
            var completionRate = result.Assignments.Count > 0
                ? result.Assignments.Count(a => a.EndTime <= workOrders
                    .Where(w => w.Id == a.WorkOrderId).Select(w => w.PlannedEndDate).FirstOrDefault())
                    / (double)result.Assignments.Count
                : 0;

            var item = new ObjectiveCompareItemDto
            {
                Objective = objective,
                ObjectiveLabel = objectiveLabels.GetValueOrDefault(objective, objective),
                Plan = plan,
                UtilizationRate = result.UtilizationRate,
                OnTimeDeliveryRate = result.OnTimeDeliveryRate,
                TotalChangeoverMinutes = result.TotalChangeoverMinutes,
                GroupCount = result.GroupCount,
                EstimatedCompletionRate = completionRate,
                TotalWorkOrders = result.Assignments.Count,
            };
            items.Add(item);

            // 加权评分：利用率40% + 准时率40% + 换线效率20%
            var score = item.UtilizationRate * 0.4 + item.OnTimeDeliveryRate * 0.4
                        + Math.Max(0, 1 - item.TotalChangeoverMinutes / 1000) * 0.2;
            if (score > bestScore)
            {
                bestScore = score;
                bestObjective = objective;
            }
        }

        return new BatchOptimizeResultDto
        {
            Items = items,
            BestOverallObjective = bestObjective,
        };
    }

    public async Task RecordAdoptionFeedbackAsync(AdoptionFeedbackRequest request, string operatorUser, CancellationToken ct = default)
    {
        var reasonCategory = Enum.TryParse<OverrideReasonCategory>(request.ReasonCategory, out var category)
            ? category
            : OverrideReasonCategory.Other;

        var feedback = _feedbackService.RecordOverride(
            request.SchedulePlanId,
            request.WorkshopId,
            request.OptimizationObjective ?? string.Empty,
            [],
            [],
            reasonCategory,
            request.ReasonDetail,
            request.MovedOrderIds,
            operatorUser,
            request.AiTraceId);

        await _scheduleRepo.SaveFeedbackAsync(feedback);
    }

    #region Private Methods

    private async Task<List<WorkOrder>> GetWorkOrdersForScheduling(OptimizeScheduleRequest request, CancellationToken ct)
    {
        if (request.WorkOrderIds != null && request.WorkOrderIds.Any())
        {
            var workOrders = new List<WorkOrder>();
            foreach (var id in request.WorkOrderIds)
            {
                var wo = await _workOrderRepo.GetByIdAsync(id);
                if (wo != null) workOrders.Add(wo);
            }
            return workOrders;
        }

        var pendingOrders = await _workOrderRepo.GetAllAsync(WorkOrderStatus.Created);
        pendingOrders.AddRange(await _workOrderRepo.GetAllAsync(WorkOrderStatus.Scheduled));
        return pendingOrders;
    }

    private async Task<Dictionary<string, int>> GetMaterialAvailability(List<string> materialCodes, CancellationToken ct)
    {
        var result = new Dictionary<string, int>();
        foreach (var code in materialCodes)
        {
            var material = await _materialRepo.GetByCodeAsync(code);
            if (material != null)
            {
                result[code] = material.AvailableQuantity - material.ReservedQuantity;
            }
        }
        return result;
    }

    private Task<string?> GetHistoricalData(string workshopId, CancellationToken ct)
    {
        // TODO: 实现历史数据获取逻辑
        return Task.FromResult<string?>(null);
    }

    private List<string> GetMaterialCodesForProduct(string productCode)
    {
        // TODO: 实现BOM查询逻辑
        return new List<string>();
    }

    private WorkOrderInfo MapToWorkOrderInfo(WorkOrder w) => new()
    {
        Id = w.Id,
        OrderNumber = w.OrderNumber,
        ProductCode = w.ProductCode,
        Quantity = w.PlannedQuantity,
        DueDate = w.PlannedEndDate,
        Priority = w.Priority,
        RouteCode = w.RouteCode
    };

    private EquipmentCapacity MapToEquipmentCapacity(Equipment e) => new()
    {
        Id = e.Id,
        EquipmentCode = e.EquipmentCode,
        Capacity = e.Capacity,
        Type = e.EquipmentType
    };

    private SchedulePlan MapToSchedulePlan(SchedulingResult result, OptimizeScheduleRequest request)
    {
        var plan = new SchedulePlan
        {
            PlanName = $"排产计划-{DateTime.UtcNow:yyyyMMddHHmmss}",
            PlanStartDate = request.StartDate ?? DateTime.UtcNow,
            PlanEndDate = request.EndDate ?? DateTime.UtcNow.AddDays(7),
            OverallUtilizationRate = result.UtilizationRate,
            OnTimeDeliveryRate = 0,
            OptimizationNotes = result.OptimizationNotes,
            Items = result.Assignments.Select((a, i) => new ScheduleItem
            {
                WorkOrderId = a.WorkOrderId,
                EquipmentId = a.EquipmentId,
                PlannedStartTime = a.StartTime,
                PlannedEndTime = a.EndTime,
                Sequence = i + 1,
                DependentItems = a.Dependencies
            }).ToList()
        };
        return plan;
    }

    private SchedulePlanDto MapToSchedulePlanDto(SchedulePlan p) => new()
    {
        Id = p.Id,
        PlanName = p.PlanName,
        PlanStartDate = p.PlanStartDate,
        PlanEndDate = p.PlanEndDate,
        OverallUtilizationRate = p.OverallUtilizationRate,
        OnTimeDeliveryRate = p.OnTimeDeliveryRate,
        OptimizationNotes = p.OptimizationNotes,
        CreatedAt = p.CreatedAt,
        Items = p.Items.Select(i => new ScheduleItemDto
        {
            Id = i.Id,
            WorkOrderId = i.WorkOrderId,
            EquipmentId = i.EquipmentId,
            PlannedStartTime = i.PlannedStartTime,
            PlannedEndTime = i.PlannedEndTime,
            Sequence = i.Sequence,
            SetupTime = i.SetupTime,
            DependentItems = i.DependentItems
        }).ToList()
    };

    private WorkOrderDto MapToWorkOrderDto(WorkOrder w) => new()
    {
        Id = w.Id,
        OrderNumber = w.OrderNumber,
        ProductCode = w.ProductCode,
        ProductName = w.ProductName,
        PlannedQuantity = w.PlannedQuantity,
        CompletedQuantity = w.CompletedQuantity,
        PlannedStartDate = w.PlannedStartDate,
        PlannedEndDate = w.PlannedEndDate,
        ActualStartDate = w.ActualStartDate,
        ActualEndDate = w.ActualEndDate,
        Status = w.Status.ToString(),
        WorkshopId = w.WorkshopId,
        RouteCode = w.RouteCode,
        Priority = w.Priority,
        ProgressPercentage = w.PlannedQuantity > 0 ? (double)w.CompletedQuantity / w.PlannedQuantity * 100 : 0,
        CreatedAt = w.CreatedAt,
        UpdatedAt = w.UpdatedAt
    };

    #endregion
}

/// <summary>
/// 分页结果
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
