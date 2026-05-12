using Microsoft.AspNetCore.SignalR;

namespace MES.Api.Hubs;

/// <summary>
/// 通知服务 — 推送实时消息到 SignalR 客户端
/// </summary>
public interface INotificationService
{
    Task NotifyEquipmentStatusChanged(string equipmentId, string equipmentName, string status);
    Task NotifyQualityAlert(string inspectionId, string productName, string severity);
    Task NotifyProductionProgress(string workOrderId, string orderNumber, double progress);
    Task NotifyAnomaly(string workOrderId, string description, string severity);
    Task NotifyInventoryChanged(string materialCode, string materialName, string transactionType, decimal quantity);
    Task NotifyPurchaseOrderStatusChanged(string orderId, string orderNumber, string status);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyEquipmentStatusChanged(string equipmentId, string equipmentName, string status)
    {
        await _hubContext.Clients.Group("all").SendAsync("EquipmentStatusChanged", new
        {
            EquipmentId = equipmentId,
            EquipmentName = equipmentName,
            Status = status,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyQualityAlert(string inspectionId, string productName, string severity)
    {
        await _hubContext.Clients.Group("all").SendAsync("QualityAlert", new
        {
            InspectionId = inspectionId,
            ProductName = productName,
            Severity = severity,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyProductionProgress(string workOrderId, string orderNumber, double progress)
    {
        await _hubContext.Clients.Group("all").SendAsync("ProductionProgress", new
        {
            WorkOrderId = workOrderId,
            OrderNumber = orderNumber,
            Progress = progress,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyAnomaly(string workOrderId, string description, string severity)
    {
        await _hubContext.Clients.Group("all").SendAsync("AnomalyAlert", new
        {
            WorkOrderId = workOrderId,
            Description = description,
            Severity = severity,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyInventoryChanged(string materialCode, string materialName, string transactionType, decimal quantity)
    {
        await _hubContext.Clients.Group("all").SendAsync("InventoryChanged", new
        {
            MaterialCode = materialCode,
            MaterialName = materialName,
            TransactionType = transactionType,
            Quantity = quantity,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyPurchaseOrderStatusChanged(string orderId, string orderNumber, string status)
    {
        await _hubContext.Clients.Group("all").SendAsync("PurchaseOrderStatusChanged", new
        {
            OrderId = orderId,
            OrderNumber = orderNumber,
            Status = status,
            Timestamp = DateTime.UtcNow
        });
    }
}
