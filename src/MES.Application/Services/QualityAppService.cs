using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Models;
using DomainInspectionResult = MES.Domain.Enums.InspectionResult;

namespace MES.Application.Services;

/// <summary>
/// 质量应用服务接口
/// </summary>
public interface IQualityAppService
{
    Task<InspectionDto> CreateInspectionAsync(CreateInspectionRequest request, CancellationToken ct = default);
    Task<InspectionDto?> GetInspectionByIdAsync(string id, CancellationToken ct = default);
    Task<List<InspectionDto>> GetInspectionsByWorkOrderAsync(string workOrderId, CancellationToken ct = default);
    Task<QualityStatisticsDto> GetStatisticsAsync(string? productCode = null, CancellationToken ct = default);
    Task<RootCauseAnalysisDto> AnalyzeRootCauseAsync(string inspectionId, CancellationToken ct = default);
    Task<SpcAnalysisDto> AnalyzeSpcTrendAsync(string processParameter, int windowSize = 20, CancellationToken ct = default);
}

/// <summary>
/// 质量应用服务实现
/// </summary>
public class QualityAppService : IQualityAppService
{
    private readonly IQualityInspectionRepository _inspectionRepo;
    private readonly IWorkOrderRepository _workOrderRepo;
    private readonly QualityAgent _qualityAgent;

    public QualityAppService(
        IQualityInspectionRepository inspectionRepo,
        IWorkOrderRepository workOrderRepo,
        QualityAgent qualityAgent)
    {
        _inspectionRepo = inspectionRepo;
        _workOrderRepo = workOrderRepo;
        _qualityAgent = qualityAgent;
    }

    public async Task<InspectionDto> CreateInspectionAsync(CreateInspectionRequest request, CancellationToken ct = default)
    {
        var inspection = new QualityInspection
        {
            WorkOrderId = request.WorkOrderId,
            ProductCode = request.ProductCode,
            ProcessName = request.ProcessName,
            InspectionPoint = request.InspectionPoint,
            InspectionQuantity = request.InspectionQuantity,
            QualifiedQuantity = request.QualifiedQuantity,
            DefectQuantity = request.DefectQuantity,
            Result = Enum.Parse<DomainInspectionResult>(request.Result),
            InspectorId = request.InspectorId,
            InspectedAt = DateTime.UtcNow
        };

        var created = await _inspectionRepo.CreateAsync(inspection);
        return MapToInspectionDto(created);
    }

    public async Task<InspectionDto?> GetInspectionByIdAsync(string id, CancellationToken ct = default)
    {
        var inspection = await _inspectionRepo.GetByIdAsync(id);
        return inspection != null ? MapToInspectionDto(inspection) : null;
    }

    public async Task<List<InspectionDto>> GetInspectionsByWorkOrderAsync(string workOrderId, CancellationToken ct = default)
    {
        var inspections = await _inspectionRepo.GetByWorkOrderAsync(workOrderId);
        return inspections.Select(MapToInspectionDto).ToList();
    }

    public async Task<QualityStatisticsDto> GetStatisticsAsync(string? productCode = null, CancellationToken ct = default)
    {
        var inspections = await _inspectionRepo.GetAllAsync();

        if (!string.IsNullOrEmpty(productCode))
            inspections = inspections.Where(i => i.ProductCode == productCode).ToList();

    var total = inspections.Count;
    var passed = inspections.Count(i => i.Result == DomainInspectionResult.Pass);
    var failed = inspections.Count(i => i.Result == DomainInspectionResult.Fail);
    var rework = inspections.Count(i => i.Result == DomainInspectionResult.Rework);

        return new QualityStatisticsDto
        {
            TotalInspections = total,
            PassedCount = passed,
            FailedCount = failed,
            ReworkCount = rework,
            PassRate = total > 0 ? (double)passed / total * 100 : 0,
            DefectRate = total > 0 ? (double)failed / total * 100 : 0,
            ReworkRate = total > 0 ? (double)rework / total * 100 : 0
        };
    }

    public async Task<RootCauseAnalysisDto> AnalyzeRootCauseAsync(string inspectionId, CancellationToken ct = default)
    {
        var inspection = await _inspectionRepo.GetByIdAsync(inspectionId);
        if (inspection == null)
            throw new InvalidOperationException($"质检记录 {inspectionId} 不存在");

        var analysis = await _qualityAgent.AnalyzeQualityIssueAsync(inspection, ct);

        return new RootCauseAnalysisDto
        {
            InspectionId = inspectionId,
            RootCauses = analysis.RootCauses.Select(rc => new RootCauseItemDto
            {
                Cause = rc.Cause,
                Probability = rc.Probability,
                Evidence = rc.Evidence
            }).ToList(),
            CorrectiveActions = analysis.CorrectiveActions,
            PreventiveMeasures = analysis.PreventiveMeasures,
            AnalysisSummary = analysis.RootCauses.FirstOrDefault()?.Cause ?? "无法确定根因"
        };
    }

    public async Task<SpcAnalysisDto> AnalyzeSpcTrendAsync(string processParameter, int windowSize = 20, CancellationToken ct = default)
    {
        // 获取最近的测量数据
        var recentInspections = await _inspectionRepo.GetRecentInspectionsAsync(processParameter, windowSize);

        // 从测量数据中提取数值（这里简化处理，实际需要从MeasurementData中提取）
        var data = recentInspections
            .Where(i => i.MeasurementData.ContainsKey(processParameter))
            .Select(i => Convert.ToDouble(i.MeasurementData[processParameter]))
            .ToList();

        if (!data.Any())
        {
            return new SpcAnalysisDto
            {
                ProcessParameter = processParameter,
                HasTrend = false,
                HasDrift = false,
                HasCycle = false,
                IsNearLimit = false,
                RecommendedAction = "数据不足，无法进行分析"
            };
        }

        // 调用AI分析SPC趋势（使用标准规格限）
        var spcAlert = await _qualityAgent.AnalyzeSpcTrendAsync(data, 10.5, 9.5, 10.0, ct);

        return new SpcAnalysisDto
        {
            ProcessParameter = processParameter,
            HasTrend = spcAlert.HasTrend,
            HasDrift = spcAlert.HasDrift,
            HasCycle = spcAlert.HasCycle,
            IsNearLimit = spcAlert.IsNearLimit,
            TrendDirection = spcAlert.TrendDirection,
            RecommendedAction = spcAlert.RecommendedAction,
            DataPoints = data
        };
    }

    #region Private Methods

    private InspectionDto MapToInspectionDto(QualityInspection i) => new()
    {
        Id = i.Id,
        WorkOrderId = i.WorkOrderId,
        ProductCode = i.ProductCode,
        ProcessName = i.ProcessName,
        InspectionPoint = i.InspectionPoint,
        InspectionQuantity = i.InspectionQuantity,
        QualifiedQuantity = i.QualifiedQuantity,
        DefectQuantity = i.DefectQuantity,
        Result = i.Result.ToString(),
        InspectorId = i.InspectorId,
        InspectedAt = i.InspectedAt,
        PassRate = i.InspectionQuantity > 0 ? (double)i.QualifiedQuantity / i.InspectionQuantity * 100 : 0
    };

    #endregion
}

/// <summary>
/// SPC分析结果DTO
/// </summary>
public class SpcAnalysisDto
{
    public string ProcessParameter { get; set; } = string.Empty;
    public bool HasTrend { get; set; }
    public bool HasDrift { get; set; }
    public bool HasCycle { get; set; }
    public bool IsNearLimit { get; set; }
    public string TrendDirection { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
    public List<double> DataPoints { get; set; } = new();
}
