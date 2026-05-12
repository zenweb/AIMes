namespace MES.Domain.Enums;

/// <summary>
/// 工单状态
/// </summary>
public enum WorkOrderStatus
{
    Created = 0,
    Scheduled = 1,
    InProgress = 2,
    Paused = 3,
    Completed = 4,
    Cancelled = 5
}