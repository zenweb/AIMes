using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;
using Moq;

namespace MES.Tests.Unit.Application;

public class AnomalyAppServiceTests
{
    private readonly Mock<IAnomalyRepository> _anomalyRepoMock = new();
    private readonly Mock<IAnomalyAnalysisService> _anomalyAnalysisMock = new();
    private readonly AnomalyAppService _sut;

    public AnomalyAppServiceTests()
    {
        _sut = new AnomalyAppService(_anomalyRepoMock.Object, _anomalyAnalysisMock.Object);
    }

    [Fact]
    public async Task CreateAnomalyAsync_WhenSeverityHasDifferentCasingAndWhitespace_ShouldPreserveCriticalSeverity()
    {
        var request = new CreateAnomalyRequest
        {
            WorkOrderNumber = "WO-ANM-001",
            OperationCode = "OP-020",
            AnomalyType = "Equipment",
            Severity = " critical ",
            Title = "主轴温升异常",
            Description = "主轴温度超过警戒线，需要进入紧急异常流转。",
            EquipmentId = "CNC-001",
            DetectedBy = "operator1"
        };

        _anomalyRepoMock
            .Setup(r => r.AddAsync(It.IsAny<ProductionAnomaly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductionAnomaly anomaly, CancellationToken _) => anomaly);

        var result = await _sut.CreateAnomalyAsync(request, CancellationToken.None);

        result.Severity.Should().Be("Critical", "紧急异常不能因为 API 输入大小写或空格差异被静默降级");
        _anomalyRepoMock.Verify(r => r.AddAsync(
            It.Is<ProductionAnomaly>(a => a.Severity == AnomalySeverity.Critical),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAnomalyAsync_WhenSeverityIsNull_ShouldDefaultToMedium()
    {
        var request = new CreateAnomalyRequest
        {
            WorkOrderNumber = "WO-ANM-NULL",
            OperationCode = "OP-020",
            AnomalyType = "Equipment",
            Severity = null!,
            Title = "未指定等级异常",
            Description = "前端缺省严重度时应进入默认中等级别，不能抛出空引用异常。",
            DetectedBy = "operator1"
        };

        _anomalyRepoMock
            .Setup(r => r.AddAsync(It.IsAny<ProductionAnomaly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductionAnomaly anomaly, CancellationToken _) => anomaly);

        var result = await _sut.CreateAnomalyAsync(request, CancellationToken.None);

        result.Severity.Should().Be("Medium", "缺省严重度应保留应用层默认值，避免请求绑定空值导致创建失败");
        _anomalyRepoMock.Verify(r => r.AddAsync(
            It.Is<ProductionAnomaly>(a => a.Severity == AnomalySeverity.Medium),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetOpenAnomaliesAsync_ShouldUseRepositoryPagingAndPropagateCancellationToken()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var anomalies = new List<ProductionAnomaly>
        {
            CreateAnomaly("WO-ANM-002", "OP-010", AnomalySeverity.High, "装配间隙超差")
        };

        _anomalyRepoMock.Setup(r => r.CountOpenAsync(ct)).ReturnsAsync(17);
        _anomalyRepoMock.Setup(r => r.GetOpenPagedAsync(2, 5, ct)).ReturnsAsync(anomalies);

        var result = await _sut.GetOpenAnomaliesAsync(2, 5, ct);

        result.Page.Should().Be(2);
        result.PageSize.Should().Be(5);
        result.TotalCount.Should().Be(17);
        result.Items.Should().ContainSingle().Which.Title.Should().Be("装配间隙超差");
        _anomalyRepoMock.Verify(r => r.CountOpenAsync(ct), Times.Once);
        _anomalyRepoMock.Verify(r => r.GetOpenPagedAsync(2, 5, ct), Times.Once);
    }

    [Fact]
    public async Task AnalyzeAnomalyAsync_ShouldTranslateAnalysisResponsesIntoPrioritizedSuggestedActions()
    {
        var anomaly = CreateAnomaly("WO-ANM-003", "OP-030", AnomalySeverity.High, "来料粘度异常");
        var aiResponse = new AnomalyResponse(
            AnomalyResponseType.AiSuggestion,
            "AI 判断该批次原料需隔离，防止继续投产。",
            "隔离批次并切换备用批次",
            "AI Agent");
        var manualResponse = new AnomalyResponse(
            AnomalyResponseType.Manual,
            "主管要求同步通知采购追溯供应商批次。",
            "通知采购追溯供应商批次",
            "leader1");

        _anomalyRepoMock.Setup(r => r.GetByIdAsync(anomaly.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(anomaly);
        _anomalyAnalysisMock.Setup(s => s.AnalyzeAsync(anomaly, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AnomalyResponse> { aiResponse, manualResponse });

        var result = await _sut.AnalyzeAnomalyAsync(anomaly.Id, CancellationToken.None);

        result.AnomalyId.Should().Be(anomaly.Id);
        result.AnalysisSummary.Should().Be("AI 分析了 2 个建议方案");
        result.SuggestedActions.Should().HaveCount(2);
        result.SuggestedActions[0].Priority.Should().Be(1);
        result.SuggestedActions[0].Action.Should().Be("隔离批次并切换备用批次");
        result.SuggestedActions[1].Priority.Should().Be(2);
        result.SuggestedActions[1].Reason.Should().Be("主管要求同步通知采购追溯供应商批次。");
    }

    private static ProductionAnomaly CreateAnomaly(
        string workOrderNumber,
        string operationCode,
        AnomalySeverity severity,
        string title)
    {
        return new ProductionAnomaly(
            new WorkOrderNumber(workOrderNumber),
            new OperationCode(operationCode),
            "Equipment",
            severity,
            title,
            $"{title} 的单元测试样例",
            detectedBy: "unit-test");
    }
}
