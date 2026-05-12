using MES.Application.DTOs;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.AI.Pro.Agents;

namespace MES.Application.Services;

public interface IAnomalyAppService
{
    Task<List<ProductionAnomalyDto>> GetOpenAnomaliesAsync(CancellationToken ct = default);
    Task<List<ProductionAnomalyDto>> GetCriticalOpenAsync(CancellationToken ct = default);
    Task<List<ProductionAnomalyDto>> GetByWorkOrderAsync(string workOrderNumber, CancellationToken ct = default);
    Task<ProductionAnomalyDetailDto?> GetAnomalyByIdAsync(string id, CancellationToken ct = default);
    Task<ProductionAnomalyDto> CreateAnomalyAsync(CreateAnomalyRequest request, CancellationToken ct = default);
    Task<ProdAnomalyResponseDto> AddResponseAsync(string anomalyId, AddAnomalyResponseRequest request, CancellationToken ct = default);
    Task<ProductionAnomalyDto> ResolveAnomalyAsync(string anomalyId, ResolveAnomalyRequest request, CancellationToken ct = default);
    Task<AnalyzeAnomalyResultDto> AnalyzeAnomalyAsync(string anomalyId, CancellationToken ct = default);
}

public class AnomalyAppService : IAnomalyAppService
{
    private readonly IAnomalyRepository _anomalyRepo;
    private readonly AnomalyAgent _anomalyAgent;

    public AnomalyAppService(IAnomalyRepository anomalyRepo, AnomalyAgent anomalyAgent)
    {
        _anomalyRepo = anomalyRepo;
        _anomalyAgent = anomalyAgent;
    }

    public async Task<List<ProductionAnomalyDto>> GetOpenAnomaliesAsync(CancellationToken ct = default)
    {
        return new List<ProductionAnomalyDto>();
    }

    public async Task<List<ProductionAnomalyDto>> GetCriticalOpenAsync(CancellationToken ct = default)
    {
        var anomalies = await _anomalyRepo.GetCriticalOpenAsync(ct);
        return anomalies.Select(MapToDto).ToList();
    }

    public async Task<List<ProductionAnomalyDto>> GetByWorkOrderAsync(string workOrderNumber, CancellationToken ct = default)
    {
        var anomalies = await _anomalyRepo.GetOpenByWorkOrderAsync(new WorkOrderNumber(workOrderNumber), ct);
        return anomalies.Select(MapToDto).ToList();
    }

    public async Task<ProductionAnomalyDetailDto?> GetAnomalyByIdAsync(string id, CancellationToken ct = default)
    {
        var anomaly = await _anomalyRepo.GetByIdAsync(id, ct);
        return anomaly != null ? MapToDetail(anomaly) : null;
    }

    public async Task<ProductionAnomalyDto> CreateAnomalyAsync(CreateAnomalyRequest request, CancellationToken ct = default)
    {
        var severity = request.Severity switch
        {
            "Low" => AnomalySeverity.Low,
            "High" => AnomalySeverity.High,
            "Critical" => AnomalySeverity.Critical,
            _ => AnomalySeverity.Medium
        };

        var anomaly = new ProductionAnomaly(
            new WorkOrderNumber(request.WorkOrderNumber),
            new OperationCode(request.OperationCode),
            request.AnomalyType,
            severity,
            request.Title,
            request.Description,
            request.EquipmentId,
            request.DetectedBy);

        var created = await _anomalyRepo.AddAsync(anomaly, ct);
        return MapToDto(created);
    }

    public async Task<ProdAnomalyResponseDto> AddResponseAsync(string anomalyId, AddAnomalyResponseRequest request, CancellationToken ct = default)
    {
        var anomaly = await _anomalyRepo.GetByIdAsync(anomalyId, ct);
        if (anomaly == null)
            throw new InvalidOperationException($"异常 {anomalyId} 不存在");

        var responseType = request.ResponseType switch
        {
            "AiSuggestion" => AnomalyResponseType.AiSuggestion,
            "System" => AnomalyResponseType.System,
            _ => AnomalyResponseType.Manual
        };

        var response = new AnomalyResponse(
            responseType,
            request.Description,
            request.SuggestedAction,
            request.SuggestedBy);

        anomaly.AddResponse(response);
        await _anomalyRepo.UpdateAsync(anomaly, ct);

        return new ProdAnomalyResponseDto
        {
            Id = response.Id,
            ResponseType = response.ResponseType.ToString(),
            Description = response.Description,
            SuggestedAction = response.SuggestedAction,
            SuggestedBy = response.SuggestedBy,
            Status = response.Status.ToString(),
            ExecutedAt = response.ExecutedAt,
            ExecutedBy = response.ExecutedBy,
            CreatedAt = response.CreatedAt
        };
    }

    public async Task<ProductionAnomalyDto> ResolveAnomalyAsync(string anomalyId, ResolveAnomalyRequest request, CancellationToken ct = default)
    {
        var anomaly = await _anomalyRepo.GetByIdAsync(anomalyId, ct);
        if (anomaly == null)
            throw new InvalidOperationException($"异常 {anomalyId} 不存在");

        anomaly.Resolve(request.RootCause, request.Resolution, request.ResolvedBy);
        await _anomalyRepo.UpdateAsync(anomaly, ct);
        return MapToDto(anomaly);
    }

    public async Task<AnalyzeAnomalyResultDto> AnalyzeAnomalyAsync(string anomalyId, CancellationToken ct = default)
    {
        var anomaly = await _anomalyRepo.GetByIdAsync(anomalyId, ct);
        if (anomaly == null)
            throw new InvalidOperationException($"异常 {anomalyId} 不存在");

        var responses = await _anomalyAgent.AnalyzeAsync(anomaly);

        return new AnalyzeAnomalyResultDto
        {
            AnomalyId = anomaly.Id,
            Title = anomaly.Title,
            AnalysisSummary = $"AI 分析了 {responses.Count} 个建议方案",
            SuggestedActions = responses.Select(r => new AnomalySuggestedActionDto
            {
                Action = r.SuggestedAction,
                Reason = r.Description,
                Priority = r.ResponseType == AnomalyResponseType.AiSuggestion ? 1 : 2
            }).ToList()
        };
    }

    private ProductionAnomalyDto MapToDto(ProductionAnomaly a) => new()
    {
        Id = a.Id,
        WorkOrderNumber = a.WorkOrderNumber.Value,
        OperationCode = a.OperationCode.Value,
        EquipmentId = a.EquipmentId,
        AnomalyType = a.AnomalyType,
        Severity = a.Severity.ToString(),
        Title = a.Title,
        Description = a.Description,
        DetectedAt = a.DetectedAt,
        DetectedBy = a.DetectedBy,
        Status = a.Status.ToString(),
        RootCause = a.RootCause,
        Resolution = a.Resolution,
        ResponseCount = a.Responses.Count
    };

    private ProductionAnomalyDetailDto MapToDetail(ProductionAnomaly a) => new()
    {
        Id = a.Id,
        WorkOrderNumber = a.WorkOrderNumber.Value,
        OperationCode = a.OperationCode.Value,
        EquipmentId = a.EquipmentId,
        AnomalyType = a.AnomalyType,
        Severity = a.Severity.ToString(),
        Title = a.Title,
        Description = a.Description,
        DetectedAt = a.DetectedAt,
        DetectedBy = a.DetectedBy,
        Status = a.Status.ToString(),
        RootCause = a.RootCause,
        Resolution = a.Resolution,
        ResolvedAt = a.ResolvedAt,
        ResolvedBy = a.ResolvedBy,
        Responses = a.Responses.Select(r => new ProdAnomalyResponseDto
        {
            Id = r.Id,
            ResponseType = r.ResponseType.ToString(),
            Description = r.Description,
            SuggestedAction = r.SuggestedAction,
            SuggestedBy = r.SuggestedBy,
            Status = r.Status.ToString(),
            ExecutedAt = r.ExecutedAt,
            ExecutedBy = r.ExecutedBy,
            CreatedAt = r.CreatedAt
        }).ToList()
    };
}
