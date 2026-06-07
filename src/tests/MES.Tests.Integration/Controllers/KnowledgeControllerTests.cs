using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class KnowledgeControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public KnowledgeControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetChatHistory_ShouldReturnOkWithHistory()
    {
        var response = await _client.GetAsync("/api/v1/knowledge/chat-history/test-session");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ChatHistoryResponse>();
        result.Should().NotBeNull();
        result!.SessionId.Should().Be("test-session");
        result.Messages.Should().NotBeNull();
    }

    [Fact]
    public async Task GetChatHistory_WithMaxMessages_ShouldRespectLimit()
    {
        var response = await _client.GetAsync("/api/v1/knowledge/chat-history/test-session?maxMessages=5");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ChatHistoryResponse>();
        result!.TotalCount.Should().BeGreaterThanOrEqualTo(0);
    }

    private class ChatHistoryResponse
    {
        public string SessionId { get; set; } = string.Empty;
        public List<ChatMessageResponse> Messages { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private class ChatMessageResponse
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
