namespace MES.Domain.Interfaces.Integration;

public sealed record WorkOrderDto(
    string OrderNumber,
    string ProductCode,
    string ProductName,
    decimal PlannedQuantity,
    DateTime PlannedStart,
    DateTime PlannedEnd,
    string Status);

public sealed record ProductionReportDto(
    string WorkOrderNumber,
    string OperationCode,
    decimal GoodQuantity,
    decimal DefectQuantity,
    DateTime ReportedAt,
    string ReporterId);

public sealed record MaterialAvailabilityDto(
    string MaterialCode,
    decimal RequestedQuantity,
    decimal AvailableQuantity,
    bool IsAvailable,
    string WarehouseId);

public sealed record MaterialReservationDto(
    string ReservationId,
    string MaterialCode,
    decimal Quantity,
    string Status,
    DateTime ReservedAt);

public sealed record MaterialCallRequest(
    string WorkOrderNumber,
    string MaterialCode,
    decimal Quantity,
    string WorkshopId,
    string StationId,
    DateTime RequiredAt);

public sealed record MaterialCallStatusDto(
    string CallId,
    string Status,
    string Message,
    DateTime UpdatedAt);

public sealed record DeliveryStatusDto(
    string CallId,
    string DeliveryId,
    string Status,
    string CurrentLocation,
    DateTime? EstimatedArrival);

public sealed record CommandResult(
    string CommandId,
    string Status,
    string Message,
    bool RequiresApproval);
