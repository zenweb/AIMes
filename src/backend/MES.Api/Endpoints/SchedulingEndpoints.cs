using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Api.Endpoints;

public static class SchedulingEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("scheduling");

    public static RouteGroupBuilder MapSchedulingEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/optimize", OptimizeScheduleAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/rule-based", RuleBasedScheduleAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>();
        group.MapGet("/current", GetCurrentPlanAsync).WithTags("排产管理");
        group.MapGet("/plans", GetAllPlansAsync).WithTags("排产管理");
        group.MapGet("/plans/{id}", GetPlanByIdAsync).WithTags("排产管理");
        group.MapPatch("/plans/{planId}/items/{itemId}", RescheduleItemAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>();
        group.MapPost("/workorders", CreateWorkOrderAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/workorders", GetWorkOrdersAsync).WithTags("排产管理");
        group.MapGet("/workorders/{id}", GetWorkOrderByIdAsync).WithTags("排产管理");
        group.MapPatch("/workorders/{id}/status", UpdateWorkOrderStatusAsync)
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapDelete("/workorders/{id}", DeleteWorkOrderAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter(Audit);
        group.MapPost("/optimize-compare", BatchOptimizeAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/adoption-feedback", SubmitAdoptionFeedbackAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        return group;
    }

    private static async Task<IResult> OptimizeScheduleAsync(
        OptimizeScheduleRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var result = await schedulingService.OptimizeScheduleAsync(request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> RuleBasedScheduleAsync(
        RuleBasedScheduleRequest request,
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IMaterialRepository materialRepo,
        IScheduleRepository scheduleRepo,
        ISchedulingRuleEngine ruleEngine,
        CancellationToken ct)
    {
        // 1. 加载待排产工单
        var workOrders = request.WorkOrderIds is { Count: > 0 }
            ? await LoadWorkOrdersByIds(workOrderRepo, request.WorkOrderIds, ct)
            : await workOrderRepo.GetAllAsync(WorkOrderStatus.Created, ct);

        // 2. 加载设备
        var equipment = await equipmentRepo.GetAllAsync(ct);
        var equipCapacity = equipment.Select(e => new EquipmentCapacity
        {
            Id = e.Id,
            EquipmentCode = e.EquipmentCode,
            Capacity = e.Capacity,
            Type = e.EquipmentType,
        }).ToList();

        // 3. 构建交期字典
        var deadlines = workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate);

        // 4. 构建 ScheduleRequest
        var scheduleRequest = new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = workOrders.Select(w => new WorkOrderInfo
            {
                Id = w.Id,
                OrderNumber = w.OrderNumber,
                ProductCode = w.ProductCode,
                Quantity = w.PlannedQuantity,
                DueDate = w.PlannedEndDate,
                Priority = w.Priority,
                RouteCode = w.RouteCode ?? "",
            }).ToList(),
            Equipment = equipCapacity,
            Deadlines = deadlines,
        };

        // 5. 构建 SchedulingContextSnapshot
        var context = new SchedulingContextSnapshot
        {
            WorkshopId = request.WorkshopId,
            SnapshotTime = DateTime.UtcNow,
            EquipmentCapacities = equipment.Select(e => new EquipmentCapacitySummary(
                e.Id, e.EquipmentCode, e.EquipmentName, e.EquipmentType,
                e.Status.ToString(), e.Capacity, 0)
            {
                TheoreticalCapacity = e.Capacity,
                ActualCapacity = e.Capacity,
            }).ToList(),
        };

        // 6. 解析优先级规则和容量策略
        var priorityRule = request.PriorityRule switch
        {
            "SPT" => PriorityRule.SPT,
            "CR" => PriorityRule.CR,
            "FCFS" => PriorityRule.FCFS,
            "WeightedComposite" => PriorityRule.WeightedComposite,
            _ => PriorityRule.EDD
        };

        var capacityStrategy = request.CapacityStrategy switch
        {
            "EarliestAvailable" => CapacitySelectionStrategy.EarliestAvailable,
            "MostSuitable" => CapacitySelectionStrategy.MostSuitable,
            "LeastChangeoverCost" => CapacitySelectionStrategy.LeastChangeoverCost,
            _ => CapacitySelectionStrategy.LeastLoaded
        };

        // 7. 执行规则引擎
        var engineResult = await ruleEngine.GenerateInitialScheduleAsync(
            scheduleRequest, context, priorityRule, capacityStrategy, ct);

        // 8. 保存排产计划
        var plan = SchedulePlan.Create(
            $"规则排产-{priorityRule}-{DateTime.UtcNow:yyyyMMddHHmmss}",
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        plan.UpdateMetrics(engineResult.UtilizationRate, engineResult.OnTimeDeliveryRate,
            $"规则引擎: {priorityRule} + {capacityStrategy} | {engineResult.BottleneckInfo}");

        plan.AddItems(engineResult.Assignments.Select((a, i) =>
            ScheduleItem.Create(a.WorkOrderId, a.EquipmentId, a.StartTime, a.EndTime,
                i + 1, setupTime: $"{a.SetupMinutes:F0}min", dependentItems: a.Dependencies)));

        var saved = await scheduleRepo.CreateAsync(plan, ct);

        // 9. 返回结果
        var planDto = MapToPlanDto(saved);
        return TypedResults.Ok(new SchedulingResultDto
        {
            Plan = planDto,
            Assignments = engineResult.Assignments.Select(a => new ScheduleAssignmentDto
            {
                WorkOrderId = a.WorkOrderId,
                EquipmentId = a.EquipmentId,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Dependencies = a.Dependencies,
            }).ToList(),
            EstimatedCompletionRate = engineResult.OnTimeDeliveryRate,
            UtilizationRate = engineResult.UtilizationRate,
            OptimizationReason = engineResult.BottleneckInfo,
            Warnings = engineResult.Validation.Violations
                .Where(v => v.Level == ConstraintViolationLevel.Warning)
                .Select(v => v.Message).ToList(),
        });
    }

    private static async Task<IResult> GetCurrentPlanAsync(
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plan = await schedulingService.GetCurrentPlanAsync(ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = "未找到当前排产计划" });
        return TypedResults.Ok(plan);
    }

    private static async Task<IResult> GetAllPlansAsync(
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plans = await schedulingService.GetAllPlansAsync(ct);
        return TypedResults.Ok(plans);
    }

    private static async Task<IResult> GetPlanByIdAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plan = await schedulingService.GetPlanByIdAsync(id, ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = $"排产计划 {id} 不存在" });
        return TypedResults.Ok(plan);
    }

    private static async Task<IResult> RescheduleItemAsync(
        string planId,
        string itemId,
        RescheduleItemRequest request,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var plan = await scheduleRepo.GetByIdAsync(planId, ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = $"排产计划 {planId} 不存在" });

        if (!plan.IsEditable)
            return TypedResults.BadRequest(new { message = "当前计划状态不允许调整" });

        var item = plan.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return TypedResults.NotFound(new { message = $"排产项 {itemId} 不存在" });

        item.Reschedule(request.PlannedStartTime, request.PlannedEndTime);

        await scheduleRepo.UpdateAsync(plan, ct);

        return TypedResults.Ok(new
        {
            planId,
            itemId,
            request.PlannedStartTime,
            request.PlannedEndTime,
        });
    }

    private static async Task<IResult> CreateWorkOrderAsync(
        CreateWorkOrderRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.CreateWorkOrderAsync(request, ct);
        return TypedResults.Created($"/api/v1/scheduling/workorders/{workOrder.Id}", workOrder);
    }

    private static async Task<IResult> GetWorkOrdersAsync(
        string? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        int page = 1,
        int pageSize = 20,
        ISchedulingAppService schedulingService = default!,
        CancellationToken ct = default)
    {
        var parameters = new WorkOrderQueryParameters
        {
            Status = status,
            WorkshopId = workshopId,
            ProductCode = productCode,
            StartDate = startDate,
            EndDate = endDate,
            Page = page,
            PageSize = pageSize
        };
        var result = await schedulingService.GetWorkOrdersAsync(parameters, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetWorkOrderByIdAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder is null)
            return TypedResults.NotFound(new { message = $"工单 {id} 不存在" });
        return TypedResults.Ok(workOrder);
    }

    private static async Task<IResult> UpdateWorkOrderStatusAsync(
        string id,
        UpdateStatusRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.UpdateWorkOrderStatusAsync(id, request.Status, ct);
        return TypedResults.Ok(workOrder);
    }

    private static async Task<IResult> DeleteWorkOrderAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder is null)
            return TypedResults.NotFound();

        await schedulingService.DeleteWorkOrderAsync(id, ct);
        return TypedResults.NoContent();
    }

    private static async Task<IResult> BatchOptimizeAsync(
        BatchOptimizeRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var result = await schedulingService.BatchOptimizeAsync(request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> SubmitAdoptionFeedbackAsync(
        AdoptionFeedbackRequest request,
        HttpContext httpContext,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var operatorUser = httpContext.User.Identity?.Name ?? "unknown";
        await schedulingService.RecordAdoptionFeedbackAsync(request, operatorUser, ct);
        return TypedResults.Created();
    }

    private static async Task<List<Domain.Entities.Production.WorkOrder>> LoadWorkOrdersByIds(
        IWorkOrderRepository repo, List<string> ids, CancellationToken ct)
    {
        var result = new List<Domain.Entities.Production.WorkOrder>();
        foreach (var id in ids)
        {
            var wo = await repo.GetByIdAsync(id, ct);
            if (wo != null) result.Add(wo);
        }
        return result;
    }

    private static SchedulePlanDto MapToPlanDto(Domain.Entities.Scheduling.SchedulePlan p) => new()
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
            DependentItems = i.DependentItems,
        }).ToList(),
    };
}
