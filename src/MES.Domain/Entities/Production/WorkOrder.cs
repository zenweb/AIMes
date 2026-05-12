using MES.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace MES.Domain.Entities.Production;

/// <summary>
/// 工单
/// </summary>
public class WorkOrder
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int PlannedQuantity { get; set; }
    public int CompletedQuantity { get; set; }
    public DateTime PlannedStartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Created;
    public string WorkshopId { get; set; } = string.Empty;
    public string RouteCode { get; set; } = string.Empty;
    public int Priority { get; set; } = 0;

    [NotMapped]
    public Dictionary<string, object> CustomFields { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}