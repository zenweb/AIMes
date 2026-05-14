using System.ComponentModel.DataAnnotations.Schema;
using MES.Domain.Enums;

namespace MES.Domain.Entities.Production;

/// <summary>
/// 工单
/// </summary>
public class WorkOrder
{
    // EF Core 需要的构造（internal 供测试项目直接实例化）
    internal WorkOrder() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string OrderNumber { get; private set; } = string.Empty;
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public int PlannedQuantity { get; private set; }
    public int CompletedQuantity { get; private set; }
    public DateTime PlannedStartDate { get; private set; }
    public DateTime PlannedEndDate { get; private set; }
    public DateTime? ActualStartDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }
    public WorkOrderStatus Status { get; private set; } = WorkOrderStatus.Created;
    public string WorkshopId { get; private set; } = string.Empty;
    public string RouteCode { get; private set; } = string.Empty;
    public int Priority { get; private set; } = 0;

    [NotMapped]
    public Dictionary<string, object> CustomFields { get; private set; } = new();

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    public static WorkOrder Create(
        string orderNumber, string productCode, string productName,
        int plannedQuantity, DateTime plannedStartDate, DateTime plannedEndDate,
        string workshopId, int priority = 0, string routeCode = "")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(orderNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(productCode);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(plannedQuantity);
        ArgumentOutOfRangeException.ThrowIfNegative(priority);

        if (plannedStartDate >= plannedEndDate)
            throw new ArgumentException("计划开始日期必须早于计划结束日期");

        return new WorkOrder
        {
            OrderNumber = orderNumber,
            ProductCode = productCode,
            ProductName = productName,
            PlannedQuantity = plannedQuantity,
            PlannedStartDate = plannedStartDate,
            PlannedEndDate = plannedEndDate,
            WorkshopId = workshopId,
            Priority = priority,
            RouteCode = routeCode,
            Status = WorkOrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public bool CanStart => Status == WorkOrderStatus.Created || Status == WorkOrderStatus.Paused;
    public bool CanComplete => Status == WorkOrderStatus.InProgress || Status == WorkOrderStatus.Paused;

    public void Start()
    {
        if (!CanStart)
            throw new InvalidOperationException($"工单当前状态 {Status} 不允许启动");

        Status = WorkOrderStatus.InProgress;
        ActualStartDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete(int completedQuantity)
    {
        if (!CanComplete)
            throw new InvalidOperationException($"工单当前状态 {Status} 不允许完成");

        CompletedQuantity = completedQuantity;
        Status = WorkOrderStatus.Completed;
        ActualEndDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
            throw new InvalidOperationException($"工单当前状态 {Status} 不允许取消");

        Status = WorkOrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Pause()
    {
        if (Status != WorkOrderStatus.InProgress)
            throw new InvalidOperationException("只有运行中的工单可以暂停");

        Status = WorkOrderStatus.Paused;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Hold()
    {
        if (Status != WorkOrderStatus.InProgress && Status != WorkOrderStatus.Paused)
            throw new InvalidOperationException("只有运行中或已暂停的工单可以挂起");

        Status = WorkOrderStatus.OnHold;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Resume()
    {
        if (Status != WorkOrderStatus.Paused && Status != WorkOrderStatus.OnHold)
            throw new InvalidOperationException("只有已暂停或挂起的工单可以恢复");

        Status = WorkOrderStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Schedule(DateTime startDate, DateTime endDate, int priority)
    {
        PlannedStartDate = startDate;
        PlannedEndDate = endDate;
        Priority = priority;
        Status = WorkOrderStatus.Scheduled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void TransitionTo(WorkOrderStatus target)
    {
        switch (target)
        {
            case WorkOrderStatus.InProgress:
                Start();
                break;
            case WorkOrderStatus.Paused:
                Pause();
                break;
            case WorkOrderStatus.OnHold:
                Hold();
                break;
            case WorkOrderStatus.Completed:
                Complete(CompletedQuantity);
                break;
            case WorkOrderStatus.Scheduled:
                Schedule(PlannedStartDate, PlannedEndDate, Priority);
                break;
            case WorkOrderStatus.Cancelled:
                Cancel();
                break;
            default:
                throw new InvalidOperationException($"不支持转换到状态 {target}");
        }
    }

    public void AddCompletedQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "完成数量必须为正数");
        if (Status != WorkOrderStatus.InProgress)
            throw new InvalidOperationException("只有运行中的工单可以报告完成数量");

        CompletedQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }
}
