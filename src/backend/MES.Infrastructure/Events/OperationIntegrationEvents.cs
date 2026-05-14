namespace MES.Infrastructure.Events;

public class OperationExecutionStartedIntegrationEvent
{
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string OperationCode { get; set; } = string.Empty;
    public string? EquipmentId { get; set; }
    public DateTime StartedAt { get; set; }
}

public class OperationReportedIntegrationEvent
{
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string OperationCode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime ReportTime { get; set; }
    public string? OperatorId { get; set; }
}

public class SchedulePlanCreatedIntegrationEvent
{
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
