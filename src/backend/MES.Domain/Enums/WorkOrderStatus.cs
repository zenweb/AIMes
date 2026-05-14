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
    OnHold = 4,
    Completed = 5,
    Cancelled = 6
}
