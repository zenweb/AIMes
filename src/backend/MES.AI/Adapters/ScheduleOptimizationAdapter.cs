using MES.AI.Core.Models;
using MES.AI.Pro.Agents;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Adapters;

public class ScheduleOptimizationAdapter : IScheduleOptimizationService
{
    private readonly SchedulingAgent _agent;

    public ScheduleOptimizationAdapter(SchedulingAgent agent)
    {
        _agent = agent;
    }

    public async Task<ScheduleOptimizationResult> OptimizeAsync(ScheduleOptimizationRequest request, CancellationToken ct = default)
    {
        var aiRequest = new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = request.Orders.Select(o => new WorkOrderInfo
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                ProductCode = o.ProductCode,
                Quantity = o.Quantity,
                DueDate = o.DueDate,
                Priority = o.Priority,
                RouteCode = o.RouteCode
            }).ToList(),
            Equipment = request.Equipment.Select(e => new EquipmentCapacity
            {
                Id = e.Id,
                EquipmentCode = e.EquipmentCode,
                Capacity = e.Capacity,
                Type = e.Type
            }).ToList(),
            Materials = request.Materials,
            Deadlines = request.Deadlines,
            HistoricalData = request.HistoricalData,
            OptimizationObjective = request.OptimizationObjective,
            LockedOrderIds = request.LockedOrderIds ?? []
        };

        var result = await _agent.OptimizeScheduleAsync(aiRequest, ct);

        return new ScheduleOptimizationResult(
            result.Assignments.Select(a => new ScheduleAssignmentData(
                a.WorkOrderId,
                a.EquipmentId,
                a.StartTime,
                a.EndTime,
                a.Dependencies,
                a.GroupId,
                a.SetupMinutes,
                a.IsOnBottleneck
            )).ToList(),
            result.EstimatedCompletion,
            result.UtilizationRate,
            result.OnTimeDeliveryRate,
            result.TotalChangeoverMinutes,
            result.GroupCount,
            result.BottleneckInfo,
            result.OptimizationNotes,
            result.Warnings,
            result.SkippedOrderIds);
    }
}
