using System.ComponentModel;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Microsoft.SemanticKernel;

namespace MES.AI.Pro.Skills;

/// <summary>
/// MES业务技能 - 排产相关操作
/// 让AI可以执行真实的MES排产操作
/// </summary>
public class SchedulingSkills
{
    private readonly IWorkOrderRepository _workOrderRepo;
    private readonly IEquipmentRepository _equipmentRepo;
    private readonly IMaterialRepository _materialRepo;
    private readonly IScheduleRepository _scheduleRepo;

    public SchedulingSkills(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IMaterialRepository materialRepo,
        IScheduleRepository scheduleRepo)
    {
        _workOrderRepo = workOrderRepo;
        _equipmentRepo = equipmentRepo;
        _materialRepo = materialRepo;
        _scheduleRepo = scheduleRepo;
    }

    [KernelFunction]
    [Description("获取工单列表和状态")]
    public async Task<List<WorkOrder>> GetWorkOrders(
        [Description("工单状态过滤，可选值：Created, Scheduled, InProgress, Paused, Completed, Cancelled")] string? status = null)
    {
        WorkOrderStatus? workOrderStatus = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<WorkOrderStatus>(status, out var parsedStatus))
        {
            workOrderStatus = parsedStatus;
        }
        return await _workOrderRepo.GetAllAsync(workOrderStatus);
    }

    [KernelFunction]
    [Description("查询设备产能和可用状态")]
    public async Task<List<Equipment>> GetEquipmentCapacity(
        [Description("车间ID")] string workshopId,
        [Description("查询日期")] DateTime date)
    {
        return await _equipmentRepo.GetByWorkshopAsync(workshopId);
    }

    [KernelFunction]
    [Description("计算物料齐套情况")]
    public async Task<MaterialAvailability> CheckMaterialAvailability(
        [Description("物料编码列表")] List<string> materialCodes,
        [Description("需求数量字典")] Dictionary<string, int> quantities)
    {
        var availability = new MaterialAvailability
        {
            IsAvailable = true,
            MissingMaterials = new List<string>()
        };

        foreach (var code in materialCodes)
        {
            var material = await _materialRepo.GetByCodeAsync(code);
            if (material == null || material.AvailableQuantity < quantities.GetValueOrDefault(code, 0))
            {
                availability.IsAvailable = false;
                availability.MissingMaterials.Add(code);
            }
        }

        return availability;
    }

    [KernelFunction]
    [Description("创建或更新排产结果")]
    public async Task SaveScheduleResult(
        [Description("排产计划结果")] SchedulePlan result)
    {
        await _scheduleRepo.CreateAsync(result);
    }

    [KernelFunction]
    [Description("获取当前排产计划")]
    public async Task<SchedulePlan?> GetCurrentSchedulePlan()
    {
        return await _scheduleRepo.GetCurrentPlanAsync();
    }

    [KernelFunction]
    [Description("获取所有排产计划")]
    public async Task<List<SchedulePlan>> GetAllSchedulePlans()
    {
        return await _scheduleRepo.GetAllAsync();
    }

    [KernelFunction]
    [Description("查询工单详情")]
    public async Task<WorkOrder?> GetWorkOrderDetail(
        [Description("工单ID")] string workOrderId)
    {
        return await _workOrderRepo.GetByIdAsync(workOrderId);
    }

    [KernelFunction]
    [Description("更新工单状态")]
    public async Task<WorkOrder> UpdateWorkOrderStatus(
        [Description("工单ID")] string workOrderId,
        [Description("新状态")] string newStatus)
    {
        var workOrder = await _workOrderRepo.GetByIdAsync(workOrderId);
        if (workOrder == null)
        {
            throw new InvalidOperationException($"工单 {workOrderId} 不存在");
        }

        workOrder.TransitionTo(Enum.Parse<WorkOrderStatus>(newStatus));
        return await _workOrderRepo.UpdateAsync(workOrder);
    }
}

/// <summary>
/// 物料齐套检查结果
/// </summary>
public class MaterialAvailability
{
    public bool IsAvailable { get; set; }
    public List<string> MissingMaterials { get; set; } = new();
    public string? Message { get; set; }
}
