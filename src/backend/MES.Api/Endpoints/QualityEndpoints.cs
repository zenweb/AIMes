using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class QualityEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("quality");

    public static RouteGroupBuilder MapQualityEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/inspections", CreateInspectionAsync)
             .WithTags("质量管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/inspections", GetInspectionsAsync).WithTags("质量管理");
        group.MapGet("/inspections/{id}", GetInspectionByIdAsync).WithTags("质量管理");
        group.MapGet("/inspections/workorder/{workOrderId}", GetInspectionsByWorkOrderAsync).WithTags("质量管理");
        group.MapGet("/statistics", GetStatisticsAsync).WithTags("质量管理");
        group.MapPost("/inspections/{inspectionId}/analyze", AnalyzeRootCauseAsync)
             .WithTags("质量管理")
             .RequireAuthorization()
             .AddEndpointFilter(Audit);
        group.MapGet("/spc/analyze", AnalyzeSpcTrendAsync).WithTags("质量管理");
        return group;
    }

    private static async Task<IResult> CreateInspectionAsync(
        CreateInspectionRequest request,
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var inspection = await qualityService.CreateInspectionAsync(request, ct);
        return TypedResults.Created($"/api/v1/quality/inspections/{inspection.Id}", inspection);
    }

    private static async Task<IResult> GetInspectionsAsync(
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var inspections = await qualityService.GetAllInspectionsAsync(ct);
        return TypedResults.Ok(inspections);
    }

    private static async Task<IResult> GetInspectionByIdAsync(
        string id,
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var inspection = await qualityService.GetInspectionByIdAsync(id, ct);
        if (inspection is null)
            return TypedResults.NotFound(new { message = $"质检记录 {id} 不存在" });
        return TypedResults.Ok(inspection);
    }

    private static async Task<IResult> GetInspectionsByWorkOrderAsync(
        string workOrderId,
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var inspections = await qualityService.GetInspectionsByWorkOrderAsync(workOrderId, ct);
        return TypedResults.Ok(inspections);
    }

    private static async Task<IResult> GetStatisticsAsync(
        string? productCode,
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var statistics = await qualityService.GetStatisticsAsync(productCode, ct);
        return TypedResults.Ok(statistics);
    }

    private static async Task<IResult> AnalyzeRootCauseAsync(
        string inspectionId,
        IQualityAppService qualityService,
        CancellationToken ct)
    {
        var analysis = await qualityService.AnalyzeRootCauseAsync(inspectionId, ct);
        return TypedResults.Ok(analysis);
    }

    private static async Task<IResult> AnalyzeSpcTrendAsync(
        string? processParameter,
        int windowSize = 20,
        IQualityAppService qualityService = default!,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(processParameter))
            return TypedResults.BadRequest(new { message = "工序参数不能为空" });
        var analysis = await qualityService.AnalyzeSpcTrendAsync(processParameter, windowSize, ct);
        return TypedResults.Ok(analysis);
    }
}
