using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Moq;

namespace MES.Tests.Unit.Application;

public class AuditLogAppServiceTests
{
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock = new();
    private readonly AuditLogAppService _sut;

    public AuditLogAppServiceTests()
    {
        _sut = new AuditLogAppService(_auditLogRepoMock.Object);
    }

    [Fact]
    public async Task GetAuditLogsAsync_ShouldUseActionAndTraceFilteredRepositoryPagingAndHidePayloadFields()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var createdAt = DateTime.UtcNow;
        var logs = new List<AuditLog>
        {
            new()
            {
                Id = "audit-001",
                UserId = "user-001",
                InitiatedBy = AuditInitiatedBy.User,
                Action = "POST",
                Resource = "employee",
                ResourceId = "emp-001",
                BusinessKey = "EMP-001",
                TraceId = "trace-001",
                OldValues = "{\"before\":true}",
                NewValues = "{\"after\":true}",
                CreatedAt = createdAt
            }
        };

        _auditLogRepoMock.Setup(r => r.CountAsync("POST", "trace-001", ct)).ReturnsAsync(11);
        _auditLogRepoMock.Setup(r => r.GetPagedAsync("POST", "trace-001", 2, 5, ct)).ReturnsAsync(logs);

        var result = await _sut.GetAuditLogsAsync("POST", "trace-001", 2, 5, ct);

        result.TotalCount.Should().Be(11);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(5);
        var item = result.Items.Should().ContainSingle().Subject;
        item.Id.Should().Be("audit-001");
        item.UserId.Should().Be("user-001");
        item.InitiatedBy.Should().Be("User");
        item.Action.Should().Be("POST");
        item.Resource.Should().Be("employee");
        item.ResourceId.Should().Be("emp-001");
        item.BusinessKey.Should().Be("EMP-001");
        item.TraceId.Should().Be("trace-001");
        item.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task GetAuditLogByIdAsync_WhenFound_ShouldReturnDetailPayloadAndAiHashes()
    {
        var log = new AuditLog
        {
            Id = "audit-detail-001",
            UserId = "agent-user",
            InitiatedBy = AuditInitiatedBy.Agent,
            Action = "UPDATE",
            Resource = "scheduling",
            ResourceId = "plan-001",
            BusinessKey = "WO-001",
            TraceId = "trace-detail-001",
            OldValues = "{\"status\":\"Draft\"}",
            NewValues = "{\"status\":\"Released\"}",
            PromptHash = "prompt-hash",
            ContextHash = "context-hash",
            IpAddress = "127.0.0.1",
            UserAgent = "unit-test"
        };

        _auditLogRepoMock.Setup(r => r.GetByIdAsync("audit-detail-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(log);

        var result = await _sut.GetAuditLogByIdAsync("audit-detail-001", CancellationToken.None);

        result.Should().NotBeNull();
        result!.InitiatedBy.Should().Be("Agent");
        result.OldValues.Should().Be("{\"status\":\"Draft\"}");
        result.NewValues.Should().Be("{\"status\":\"Released\"}");
        result.PromptHash.Should().Be("prompt-hash");
        result.ContextHash.Should().Be("context-hash");
        result.IpAddress.Should().Be("127.0.0.1");
        result.UserAgent.Should().Be("unit-test");
    }

    [Fact]
    public async Task WriteAuditLogAsync_ShouldPersistInitiatorAndRequestContext()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;

        await _sut.WriteAuditLogAsync(
            userId: "operator-001",
            action: "DELETE",
            resource: "routing",
            resourceId: "route-001",
            oldValues: "{\"status\":\"Active\"}",
            newValues: null,
            ipAddress: "10.0.0.8",
            userAgent: "MES-Test",
            initiatedBy: AuditInitiatedBy.System,
            ct: ct);

        _auditLogRepoMock.Verify(r => r.AddAsync(
            It.Is<AuditLog>(log =>
                log.UserId == "operator-001"
                && log.Action == "DELETE"
                && log.Resource == "routing"
                && log.ResourceId == "route-001"
                && log.OldValues == "{\"status\":\"Active\"}"
                && log.NewValues == null
                && log.IpAddress == "10.0.0.8"
                && log.UserAgent == "MES-Test"
                && log.InitiatedBy == AuditInitiatedBy.System
                && log.CreatedAt <= DateTime.UtcNow),
            ct), Times.Once);
    }
}
