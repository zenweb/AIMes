using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;

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
    private readonly IScheduleOptimizationService _optimizationService;
    private readonly IAdoptionFeedbackService _feedbackService;
    private readonly IBomRepository _bomRepo;

    public SchedulingAppService(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IMaterialRepository materialRepo,
        IScheduleRepository scheduleRepo,
        IScheduleOptimizationService optimizationService,
        IAdoptionFeedbackService feedbackService,
        IBomRepository bomRepo)
    {
        _workOrderRepo = workOrderRepo;
        _equipmentRepo = equipmentRepo;
        _materialRepo = materialRepo;
        _scheduleRepo = scheduleRepo;
        _optimizationService = optimizationService;
        _feedbackService = feedbackService;
        _bomRepo = bomRepo;
    }

    public async Task<SchedulingResultDto> OptimizeScheduleAsync(OptimizeScheduleRequest request, CancellationToken ct = default)
    {
        // 1. 获取待排产工单
        var workOrders = await GetWorkOrdersForScheduling(request, ct);

        // 2. 获取设备产能
        var equipment = await _equipmentRepo.GetByWorkshopAsync(request.WorkshopId);

        // 3. 获取物料齐套情况
        var productCodes = workOrders.Select(w => w.ProductCode).Distinct().ToList();
        var materialCodeTasks = productCodes.Select(async pc => await GetMaterialCodesForProductAsync(pc));
        var materialCodeSets = await Task.WhenAll(materialCodeTasks);
        var materialCodes = materialCodeSets.SelectMany(mc => mc).Distinct().ToList();
        var materials = await GetMaterialAvailability(materialCodes, ct);

        // 4. 构建排产请求
        var scheduleRequest = new ScheduleOptimizationRequest(
            request.WorkshopId,
            workOrders.Select(MapToWorkOrderInfo).ToList(),
            equipment.Select(MapToEquipmentCapacity).ToList(),
            materials,
            workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate),
            request.ConsiderHistoricalData ? await GetHistoricalData(request.WorkshopId, ct) : null,
            request.OptimizationObjective,
            null);

        // 5. 调用AI排产Agent
        var result = await _optimizationService.OptimizeAsync(scheduleRequest, ct);

        // 6. 保存排产计划
        var plan = MapToSchedulePlan(result, request);
        await _scheduleRepo.CreateAsync(plan);

        // 7. 返回结果
        var planDto = MapToSchedulePlanDto(plan);
        planDto.TotalChangeoverMinutes = result.TotalChangeoverMinutes;
        planDto.GroupCount = result.GroupCount;
        planDto.Warnings = result.Warnings.ToList();
        planDto.SkippedOrderIds = result.SkippedOrderIds.ToList();

        return new SchedulingResultDto
        {
            Plan = planDto,
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
            OptimizationReason = result.OptimizationNotes,
            Warnings = result.Warnings.ToList()
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
        var workOrder = WorkOrder.Create(
            request.OrderNumber,
            request.ProductCode,
            request.ProductName,
            request.PlannedQuantity,
            request.PlannedStartDate,
            request.PlannedEndDate,
            request.WorkshopId,
            request.Priority,
            request.RouteCode ?? string.Empty);

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

        workOrder.TransitionTo(Enum.Parse<WorkOrderStatus>(status));
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
        var productCodes = workOrders.Select(w => w.ProductCode).Distinct().ToList();
        var materialCodeLookup = await Task.WhenAll(productCodes.Select(async pc => await GetMaterialCodesForProductAsync(pc)));
        var materialCodes = materialCodeLookup.SelectMany(mc => mc).Distinct().ToList();
        var materials = await GetMaterialAvailability(materialCodes, ct);

        var baseRequest = new ScheduleOptimizationRequest(
            request.WorkshopId,
            workOrders.Select(MapToWorkOrderInfo).ToList(),
            equipment.Select(MapToEquipmentCapacity).ToList(),
            materials,
            workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate),
            null,
            null,
            null);

        // 各目标并行优化
        var tasks = objectives.Select(objective =>
            _optimizationService.OptimizeAsync(baseRequest with { OptimizationObjective = objective }, ct));

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

    private async Task<List<string>> GetMaterialCodesForProductAsync(string productCode)
    {
        var boms = await _bomRepo.GetByProductCodeAsync(new MES.Domain.ValueObjects.ProductCode(productCode));
        return boms.SelectMany(b => b.Items.Select(i => i.MaterialCode.Value)).Distinct().ToList();
    }

    private ScheduleOrderInfo MapToWorkOrderInfo(WorkOrder w) => new(
        w.Id,
        w.OrderNumber,
        w.ProductCode,
        w.PlannedQuantity,
        w.PlannedEndDate,
        w.Priority,
        w.RouteCode);

    private ScheduleEquipmentInfo MapToEquipmentCapacity(Equipment e) => new(
        e.Id,
        e.EquipmentCode,
        e.Capacity,
        e.EquipmentType);

    private SchedulePlan MapToSchedulePlan(ScheduleOptimizationResult result, OptimizeScheduleRequest request)
    {
        var plan = SchedulePlan.Create(
            $"排产计划-{DateTime.UtcNow:yyyyMMddHHmmss}",
            request.StartDate ?? DateTime.UtcNow,
            request.EndDate ?? DateTime.UtcNow.AddDays(7));

        plan.UpdateMetrics(result.UtilizationRate, 0, result.OptimizationNotes);

        plan.AddItems(result.Assignments.Select((a, i) =>
            ScheduleItem.Create(a.WorkOrderId, a.EquipmentId, a.StartTime, a.EndTime,
                i + 1, dependentItems: a.Dependencies)));

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

