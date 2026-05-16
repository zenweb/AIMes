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
        if (execution == null)
        {
            var workOrder = (await _workOrderRepository.GetAllAsync())
                .FirstOrDefault(w => w.OrderNumber == request.Code || w.Id == request.Code);

            if (workOrder == null)
                throw new InvalidOperationException("Operation or work order was not found.");

            execution = new OperationExecution(workOrder.Id, workOrder.RouteCode, string.IsNullOrWhiteSpace(workOrder.RouteCode) ? "Default Operation" : workOrder.RouteCode);
            await _operationRepository.AddExecutionAsync(execution, ct);
        }

        var relatedWorkOrder = await _workOrderRepository.GetByIdAsync(execution.WorkOrderId)
            ?? throw new InvalidOperationException("Related work order was not found.");

        if (!string.IsNullOrWhiteSpace(request.OperatorId) && !string.IsNullOrWhiteSpace(request.StationId))
        {
            execution.BindOperatorAndStation(request.OperatorId, request.StationId);
            await _operationRepository.UpdateExecutionAsync(execution, ct);
        }

        return ToInfoDto(execution, relatedWorkOrder);
    }

    public async Task<OperationResultDto> StartAsync(string operationId, StartOperationRequest request, CancellationToken ct = default)
    {
        var execution = await GetExecution(operationId, ct);
        execution.BindOperatorAndStation(request.OperatorId, request.StationId, request.EquipmentId);
        execution.Start();
        await _operationRepository.UpdateExecutionAsync(execution, ct);

        return new OperationResultDto { OperationId = execution.Id, Status = execution.Status.ToString(), Message = "Operation started." };
    }

    public async Task<OperationResultDto> CompleteAsync(string operationId, CompleteOperationRequest request, CancellationToken ct = default)
    {
        await using var scope = await _unitOfWork.BeginAsync(ct);
        var execution = await GetExecution(operationId, ct);
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

        var workOrder = await _workOrderRepository.GetByIdAsync(execution.WorkOrderId)
            ?? throw new InvalidOperationException("Related work order was not found.");
        workOrder.AddCompletedQuantity(request.Quantity);
        if (workOrder.CompletedQuantity >= workOrder.PlannedQuantity)
        {
            workOrder.Complete(workOrder.CompletedQuantity);
        }
        await _workOrderRepository.UpdateAsync(workOrder);

        await _operationRepository.UpdateExecutionAsync(execution, ct);
        await _operationRepository.AddReportAsync(report, ct);

        await scope.CommitAsync(ct);
        return new OperationResultDto { OperationId = execution.Id, Status = execution.Status.ToString(), Message = "Operation completed." };
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

    private static OperationInfoDto ToInfoDto(OperationExecution execution, WorkOrder workOrder)
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
            Status = execution.Status.ToString()
        };
    }
}
