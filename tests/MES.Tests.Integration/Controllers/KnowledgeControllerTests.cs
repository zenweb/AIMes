using System.Net;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class KnowledgeControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public KnowledgeControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetChatHistory_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/knowledge/chat-history/test-session");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
