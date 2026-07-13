using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Domain.Entities;

namespace MES.Tests.Integration.Controllers;

public sealed class AuditLogControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuditLogControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAuditLogs_WithTraceId_ShouldReturnOnlyTheMatchingPersistedEvidence()
    {
        var matchingTraceId = $"trace-audit-query-{Guid.NewGuid():N}";
        var otherTraceId = $"trace-audit-query-{Guid.NewGuid():N}";
        _factory.SeedData(db =>
        {
            db.AuditLogs.AddRange(
                new AuditLog
                {
                    Id = $"audit-query-match-{Guid.NewGuid():N}",
                    UserId = "audit-reviewer",
                    Action = "AuditReplayQuery",
                    Resource = "audit-log",
                    TraceId = matchingTraceId
                },
                new AuditLog
                {
                    Id = $"audit-query-other-{Guid.NewGuid():N}",
                    UserId = "audit-reviewer",
                    Action = "AuditReplayQuery",
                    Resource = "audit-log",
                    TraceId = otherTraceId
                });
        });

        var response = await _client.GetAsync($"/api/v1/audit-logs/?traceId={Uri.EscapeDataString(matchingTraceId)}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var audit = await response.Content.ReadFromJsonAsync<PagedResultResponse<AuditLogResponse>>();
        audit.Should().NotBeNull();
        audit!.Items.Should().ContainSingle(item => item.TraceId == matchingTraceId);
        audit.Items.Should().OnlyContain(item => item.TraceId == matchingTraceId);
    }

    private sealed class PagedResultResponse<T>
    {
        public List<T> Items { get; set; } = [];
    }

    private sealed class AuditLogResponse
    {
        public string? TraceId { get; set; }
    }
}
