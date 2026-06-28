using MES.Application.DTOs;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;

namespace MES.Application.Services;

public interface IOperationService
{
    Task<OperationInfoDto> ScanAsync(ScanOperationRequest request, CancellationToken ct = default);
    Task<OperationResultDto> StartAsync(string operationId, StartOperationRequest request, CancellationToken ct = default);
    Task<OperationResultDto> CompleteAsync(string operationId, CompleteOperationRequest request, CancellationToken ct = default);
    Task<OperationResultDto> ReportExceptionAsync(string operationId, ReportExceptionRequest request, CancellationToken ct = default);
}

public class OperationService : IOperationService
{
    private readonly IOperationRepository _operationRepository;
    private readonly IWorkOrderRepository _workOrderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OperationService(IOperationRepository operationRepository, IWorkOrderRepository workOrderRepository, IUnitOfWork unitOfWork)
    {
        _operationRepository = operationRepository;
        _workOrderRepository = workOrderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OperationInfoDto> ScanAsync(ScanOperationRequest request, CancellationToken ct = default)
    {
        var execution = await _operationRepository.GetExecutionByCodeAsync(request.Code, ct);
        WorkOrder? relatedWorkOrder = null;
        if (execution == null)
        {
            execution = await _unitOfWork.ExecuteAsync(async innerCt =>
            {
                var workOrder = await _workOrderRepository.GetByCodeAsync(request.Code, innerCt);

                if (workOrder == null)
                    throw new InvalidOperationException("Operation or work order was not found.");

                relatedWorkOrder = workOrder;
                var existingExecution = (await GetOrderedExecutionsByWorkOrderIdAsync(workOrder.Id, innerCt))
                    .FirstOrDefault();
                if (existingExecution != null)
                {
                    return existingExecution;
                }

                var createdExecution = new OperationExecution(workOrder.Id, workOrder.RouteCode, string.IsNullOrWhiteSpace(workOrder.RouteCode) ? "Default Operation" : workOrder.RouteCode);
                if (!string.IsNullOrWhiteSpace(request.OperatorId) && !string.IsNullOrWhiteSpace(request.StationId))
                {
                    createdExecution.BindOperatorAndStation(request.OperatorId, request.StationId);
                }

                await _operationRepository.AddExecutionAsync(createdExecution, innerCt);
                return createdExecution;
            }, ct);
        }

        relatedWorkOrder ??= await _workOrderRepository.GetByIdAsync(execution.WorkOrderId, ct)
            ?? throw new InvalidOperationException("Related work order was not found.");

        if (!string.IsNullOrWhiteSpace(request.OperatorId) && !string.IsNullOrWhiteSpace(request.StationId))
        {
            execution.BindOperatorAndStation(request.OperatorId, request.StationId);
            await _unitOfWork.ExecuteAsync(innerCt => _operationRepository.UpdateExecutionAsync(execution, innerCt), ct);
        }

        var nextExecution = await GetNextExecutionAsync(execution, ct);

        return ToInfoDto(execution, relatedWorkOrder, nextExecution);
    }

    public async Task<OperationResultDto> StartAsync(string operationId, StartOperationRequest request, CancellationToken ct = default)
    {
        var execution = await GetExecution(operationId, ct);
        execution.BindOperatorAndStation(request.OperatorId, request.StationId, request.EquipmentId);
        execution.Start();
        var workOrder = await _workOrderRepository.GetByIdAsync(execution.WorkOrderId, ct)
            ?? throw new InvalidOperationException("Related work order was not found.");
        if (workOrder.CanStart)
        {
            workOrder.Start();
            await _workOrderRepository.UpdateAsync(workOrder, ct);
        }
        await _operationRepository.UpdateExecutionAsync(execution, ct);

        return new OperationResultDto { OperationId = execution.Id, Status = execution.Status.ToString(), Message = "Operation started." };
    }

    public Task<OperationResultDto> CompleteAsync(string operationId, CompleteOperationRequest request, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
        {
            var execution = await GetExecution(operationId, innerCt);
            execution.Complete(request.Quantity);

            var report = new OperationReport(
                execution.WorkOrderId,
                execution.Id,
                request.Quantity,
                request.DefectQuantity,
                new ParameterSnapshot(request.Parameters),
                request.Materials.Select(m => new OperationReportMaterialConsumed(m.MaterialCode, m.Quantity, m.Unit, m.BatchNumber)),
                request.InspectionResult,
                request.ReportedBy);

            var workOrder = await _workOrderRepository.GetByIdAsync(execution.WorkOrderId, innerCt)
                ?? throw new InvalidOperationException("Related work order was not found.");
            workOrder.AddCompletedQuantity(request.Quantity);
            if (workOrder.CompletedQuantity >= workOrder.PlannedQuantity)
            {
                workOrder.Complete(workOrder.CompletedQuantity);
            }
            await _workOrderRepository.UpdateAsync(workOrder, innerCt);

            await _operationRepository.UpdateExecutionAsync(execution, innerCt);
            await _operationRepository.AddReportAsync(report, innerCt);

            return new OperationResultDto { OperationId = execution.Id, Status = execution.Status.ToString(), Message = "Operation completed." };
        }, ct);
    }

    public async Task<OperationResultDto> ReportExceptionAsync(string operationId, ReportExceptionRequest request, CancellationToken ct = default)
    {
        var execution = await GetExecution(operationId, ct);
        execution.ReportException(request.Reason);
        await _operationRepository.UpdateExecutionAsync(execution, ct);

        return new OperationResultDto { OperationId = execution.Id, Status = execution.Status.ToString(), Message = "Operation exception reported." };
    }

    private async Task<OperationExecution> GetExecution(string operationId, CancellationToken ct)
    {
        return await _operationRepository.GetExecutionByIdAsync(operationId, ct)
            ?? throw new InvalidOperationException("Operation execution was not found.");
    }

    private async Task<OperationExecution?> GetNextExecutionAsync(OperationExecution execution, CancellationToken ct)
    {
        var executions = await GetOrderedExecutionsByWorkOrderIdAsync(execution.WorkOrderId, ct);
        var currentIndex = executions
            .Select((item, index) => new { item, index })
            .FirstOrDefault(pair => pair.item.Id == execution.Id)
            ?.index;

        return currentIndex.HasValue && currentIndex.Value + 1 < executions.Count
            ? executions[currentIndex.Value + 1]
            : null;
    }

    private async Task<IReadOnlyList<OperationExecution>> GetOrderedExecutionsByWorkOrderIdAsync(string workOrderId, CancellationToken ct)
    {
        var executions = await _operationRepository.GetExecutionsByWorkOrderIdAsync(workOrderId, ct);
        return executions
            .OrderBy(execution => new OperationCode(execution.OperationCode).NumericSequence)
            .ThenBy(execution => execution.OperationCode, StringComparer.OrdinalIgnoreCase)
            .ThenBy(execution => execution.CreatedAt)
            .ToList();
    }

    private static OperationInfoDto ToInfoDto(OperationExecution execution, WorkOrder workOrder, OperationExecution? nextExecution = null)
    {
        return new OperationInfoDto
        {
            OperationId = execution.Id,
            WorkOrderId = workOrder.Id,
            WorkOrderNumber = workOrder.OrderNumber,
            ProductCode = workOrder.ProductCode,
            ProductName = workOrder.ProductName,
            OperationCode = execution.OperationCode,
            OperationName = execution.OperationName,
            PlannedQuantity = workOrder.PlannedQuantity,
            CompletedQuantity = workOrder.CompletedQuantity,
            Status = execution.Status.ToString(),
            NextOperation = nextExecution == null
                ? null
                : new OperationInfoDto
                {
                    OperationId = nextExecution.Id,
                    WorkOrderId = workOrder.Id,
                    WorkOrderNumber = workOrder.OrderNumber,
                    ProductCode = workOrder.ProductCode,
                    ProductName = workOrder.ProductName,
                    OperationCode = nextExecution.OperationCode,
                    OperationName = nextExecution.OperationName,
                    PlannedQuantity = workOrder.PlannedQuantity,
                    CompletedQuantity = workOrder.CompletedQuantity,
                    Status = nextExecution.Status.ToString()
                }
        };
    }
}
