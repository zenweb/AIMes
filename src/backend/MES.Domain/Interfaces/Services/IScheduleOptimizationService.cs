namespace MES.Domain.Interfaces.Services;

public record ScheduleOrderInfo(
    string Id,
    string OrderNumber,
    string ProductCode,
    int Quantity,
    DateTime DueDate,
    int Priority,
    string RouteCode);

public record ScheduleEquipmentInfo(
    string Id,
    string EquipmentCode,
    double Capacity,
    string Type);

public record ScheduleAssignmentData(
    string WorkOrderId,
    string EquipmentId,
    DateTime StartTime,
    DateTime EndTime,
    List<string> Dependencies,
    string? GroupId,
    double SetupMinutes,
    bool IsOnBottleneck);

public record ScheduleOptimizationRequest(
    string WorkshopId,
    List<ScheduleOrderInfo> Orders,
    List<ScheduleEquipmentInfo> Equipment,
    Dictionary<string, int> Materials,
    Dictionary<string, DateTime> Deadlines,
    string? HistoricalData,
    string? OptimizationObjective,
    List<string>? LockedOrderIds);

public record ScheduleOptimizationResult(
    List<ScheduleAssignmentData> Assignments,
    DateTime EstimatedCompletion,
    double UtilizationRate,
    double OnTimeDeliveryRate,
    double TotalChangeoverMinutes,
    int GroupCount,
    string? BottleneckInfo,
    string OptimizationNotes,
    IReadOnlyList<string> Warnings,
    IReadOnlyList<string> SkippedOrderIds);

public interface IScheduleOptimizationService
{
    Task<ScheduleOptimizationResult> OptimizeAsync(ScheduleOptimizationRequest request, CancellationToken ct = default);
}
