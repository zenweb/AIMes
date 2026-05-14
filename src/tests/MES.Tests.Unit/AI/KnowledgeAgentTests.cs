using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.AI;

public class KnowledgeAgentTests
{
    private readonly Mock<ILlmGateway> _llmMock = new();
    private readonly Mock<IVectorStoreService> _vectorMock = new();
    private readonly KnowledgeAgent _agent;

    public KnowledgeAgentTests()
    {
        _agent = new KnowledgeAgent(_llmMock.Object, _vectorMock.Object);
    }

    [Fact]
    public async Task AnswerQuestionAsync_ReturnsAnswer()
    {
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _vectorMock.Setup(x => x.SearchAsync("knowledge-documents", It.IsAny<float[]>(), 5))
            .ReturnsAsync([
                new DocumentChunk
                {
                    Id = "doc-1",
                    Content = "CNC-001 设备利用率 85%",
                    Source = "设备台账",
                    CreatedAt = DateTime.UtcNow
                }
            ]);
        _llmMock.Setup(x => x.GenerateTextAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("CNC-001 当前利用率 85%");

        var result = await _agent.AnswerQuestionAsync("CNC-001 利用率多少？");

        result.Should().NotBeNull();
        result.Answer.Should().Contain("85%");
        result.Sources.Should().HaveCount(1);
        result.Sources[0].Id.Should().Be("doc-1");
    }

    [Fact]
    public async Task IndexDocumentAsync_StoresAndReturns()
    {
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f, 0.3f });
        _vectorMock.Setup(x => x.UpsertAsync("knowledge-documents", It.IsAny<IEnumerable<DocumentChunk>>()))
            .Returns(Task.CompletedTask);

        var result = await _agent.IndexDocumentAsync("doc-new", "设备操作规程 v2",
            new Dictionary<string, string> { ["source"] = "SOP" });

        result.Should().NotBeNull();
        result.Id.Should().Be("doc-new");
        result.Content.Should().Be("设备操作规程 v2");
        result.Metadata["source"].Should().Be("SOP");
    }

    [Fact]
    public async Task FindSimilarDocumentsAsync_ReturnsResults()
    {
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _vectorMock.Setup(x => x.SearchAsync("knowledge-documents", It.IsAny<float[]>(), 3))
            .ReturnsAsync([
                new DocumentChunk { Id = "doc-1", Content = "内容1", Source = "src1" },
                new DocumentChunk { Id = "doc-2", Content = "内容2", Source = "src2" },
            ]);

        var results = await _agent.FindSimilarDocumentsAsync("查询", topK: 3);

        results.Should().HaveCount(2);
        results.Should().Contain(d => d.Id == "doc-1");
    }
}
