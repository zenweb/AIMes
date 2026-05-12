using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace MES.AI.Skills;

/// <summary>
/// MES业务技能 - 质量相关操作
/// 让AI可以执行真实的质量管理操作
/// </summary>
public class QualitySkills
{
    private readonly IQualityInspectionRepository _inspectionRepo;

    public QualitySkills(IQualityInspectionRepository inspectionRepo)
    {
        _inspectionRepo = inspectionRepo;
    }

    [KernelFunction]
    [Description("获取质检记录列表")]
    public async Task<List<QualityInspection>> GetInspections(
        [Description("产品编码，可选")] string? productCode = null,
        [Description("工序名称，可选")] string? processName = null,
        [Description("检验结果，可选值：Pass, Fail, Rework, Scrap")] string? result = null,
        [Description("返回记录数限制，默认100")] int limit = 100)
    {
        var inspections = await _inspectionRepo.GetAllAsync();

        var query = inspections.AsEnumerable();

        if (!string.IsNullOrEmpty(productCode))
            query = query.Where(i => i.ProductCode == productCode);

        if (!string.IsNullOrEmpty(processName))
            query = query.Where(i => i.ProcessName == processName);

        if (!string.IsNullOrEmpty(result))
            query = query.Where(i => i.Result.ToString() == result);

        return query.Take(limit).ToList();
    }

    [KernelFunction]
    [Description("获取质检详情")]
    public async Task<QualityInspection?> GetInspectionDetail(
        [Description("质检记录ID")] string inspectionId)
    {
        return await _inspectionRepo.GetByIdAsync(inspectionId);
    }

    [KernelFunction]
    [Description("创建质检记录")]
    public async Task<QualityInspection> CreateInspection(
        [Description("工单ID")] string workOrderId,
        [Description("产品编码")] string productCode,
        [Description("工序名称")] string processName,
        [Description("检验点")] string inspectionPoint,
        [Description("检验数量")] int inspectionQuantity,
        [Description("合格数量")] int qualifiedQuantity,
        [Description("不良数量")] int defectQuantity,
        [Description("检验结果：Pass, Fail, Rework, Scrap")] string result,
        [Description("检验员ID")] string inspectorId)
    {
        var inspection = new QualityInspection
        {
            Id = Guid.NewGuid().ToString(),
            WorkOrderId = workOrderId,
            ProductCode = productCode,
            ProcessName = processName,
            InspectionPoint = inspectionPoint,
            InspectionQuantity = inspectionQuantity,
            QualifiedQuantity = qualifiedQuantity,
            DefectQuantity = defectQuantity,
            Result = Enum.Parse<InspectionResult>(result),
            InspectorId = inspectorId,
            InspectedAt = DateTime.UtcNow
        };

        return await _inspectionRepo.CreateAsync(inspection);
    }

    [KernelFunction]
    [Description("获取质量统计报表")]
    public async Task<QualityStatistics> GetQualityStatistics(
        [Description("产品编码，可选")] string? productCode = null)
    {
        var inspections = await _inspectionRepo.GetAllAsync();

        if (!string.IsNullOrEmpty(productCode))
            inspections = inspections.Where(i => i.ProductCode == productCode).ToList();

        var total = inspections.Count;
        var passed = inspections.Count(i => i.Result == InspectionResult.Pass);
        var failed = inspections.Count(i => i.Result == InspectionResult.Fail);
        var rework = inspections.Count(i => i.Result == InspectionResult.Rework);

        return new QualityStatistics
        {
            TotalInspections = total,
            PassedCount = passed,
            FailedCount = failed,
            ReworkCount = rework,
            PassRate = total > 0 ? (double)passed / total * 100 : 0,
            DefectRate = total > 0 ? (double)failed / total * 100 : 0
        };
    }

    [KernelFunction]
    [Description("按工单获取质检记录")]
    public async Task<List<QualityInspection>> GetInspectionsByWorkOrder(
        [Description("工单ID")] string workOrderId)
    {
        return await _inspectionRepo.GetByWorkOrderAsync(workOrderId);
    }

    [KernelFunction]
    [Description("获取产品质检记录")]
    public async Task<List<QualityInspection>> GetInspectionsByProduct(
        [Description("产品编码")] string productCode)
    {
        return await _inspectionRepo.GetByProductAsync(productCode);
    }
}

/// <summary>
/// 质量统计数据
/// </summary>
public class QualityStatistics
{
    public int TotalInspections { get; set; }
    public int PassedCount { get; set; }
    public int FailedCount { get; set; }
    public int ReworkCount { get; set; }
    public double PassRate { get; set; }
    public double DefectRate { get; set; }
}
