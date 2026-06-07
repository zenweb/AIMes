using System.Text;
using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.Application;

public class KnowledgeAppServiceTests
{
    private readonly Mock<ILlmGateway> _llmGatewayMock = new();
    private readonly Mock<IVectorStoreService> _vectorStoreMock = new();
    private readonly KnowledgeAppService _sut;

    public KnowledgeAppServiceTests()
    {
        _sut = new KnowledgeAppService(_llmGatewayMock.Object, _vectorStoreMock.Object);
    }

    [Fact]
    public async Task QueryAsync_ShouldSearchKnowledgeAndAppendChatHistoryWithSourceIds()
    {
        var chunks = new List<DocumentChunk>
        {
            new()
            {
                Id = "doc-001",
                Source = "SOP-CNC",
                Content = "CNC 主轴温度超过 75 度时，需要停机检查冷却液。"
            }
        };
        _llmGatewayMock.Setup(g => g.GenerateEmbeddingAsync("主轴温度报警怎么办？", It.IsAny<CancellationToken>()))
            .ReturnsAsync([0.1f, 0.2f]);
        _vectorStoreMock.Setup(v => v.SearchAsync("mes-knowledge", It.IsAny<float[]>(), 3, It.IsAny<CancellationToken>()))
            .ReturnsAsync(chunks);
        _llmGatewayMock.Setup(g => g.GenerateTextAsync(It.Is<string>(prompt => prompt.Contains("SOP-CNC") || prompt.Contains("CNC 主轴温度")), It.IsAny<CancellationToken>()))
            .ReturnsAsync("请停机并检查冷却液。");

        var response = await _sut.QueryAsync(new KnowledgeQueryRequest
        {
            Question = "主轴温度报警怎么办？",
            SessionId = "session-knowledge-001",
            TopK = 3
        }, CancellationToken.None);

        response.Answer.Should().Be("请停机并检查冷却液。");
        response.SessionId.Should().Be("session-knowledge-001");
        response.Confidence.Should().Be(0.85);
        response.Sources.Should().ContainSingle().Which.SourceId.Should().Be("doc-001");
        var history = await _sut.GetChatHistoryAsync("session-knowledge-001", ct: CancellationToken.None);
        history.TotalCount.Should().Be(2);
        history.Messages.Select(m => m.Role).Should().Equal("user", "assistant");
        history.Messages[1].SourceIds.Should().ContainSingle().Which.Should().Be("doc-001");
    }

    [Fact]
    public async Task UploadDocumentAsync_WhenContentIsBlank_ShouldReturnSkippedWithoutEmbeddingOrUpsert()
    {
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(" \r\n\t "));

        var response = await _sut.UploadDocumentAsync(stream, "blank.txt", "SOP", CancellationToken.None);

        response.FileName.Should().Be("blank.txt");
        response.ChunkCount.Should().Be(0);
        response.Status.Should().Be("Skipped");
        _llmGatewayMock.Verify(g => g.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _vectorStoreMock.Verify(v => v.UpsertAsync(It.IsAny<string>(), It.IsAny<IEnumerable<DocumentChunk>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UploadDocumentAsync_ShouldSkipBlankChunksAndPreserveCategoryMetadata()
    {
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes("第一段工艺要求。\n\n\n第二段质量要求。"));
        var capturedChunks = new List<DocumentChunk>();
        _llmGatewayMock.Setup(g => g.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([0.3f, 0.4f]);
        _vectorStoreMock
            .Setup(v => v.UpsertAsync("mes-knowledge", It.IsAny<IEnumerable<DocumentChunk>>(), It.IsAny<CancellationToken>()))
            .Callback<string, IEnumerable<DocumentChunk>, CancellationToken>((_, chunks, _) => capturedChunks = chunks.ToList())
            .Returns(Task.CompletedTask);

        var response = await _sut.UploadDocumentAsync(stream, "process.md", "Process", CancellationToken.None);

        response.Status.Should().Be("Success");
        response.ChunkCount.Should().Be(1);
        capturedChunks.Should().ContainSingle();
        capturedChunks[0].Content.Should().Be("第一段工艺要求。\n\n\n第二段质量要求。");
        capturedChunks[0].Source.Should().Be("process.md");
        capturedChunks[0].Metadata["Category"].Should().Be("Process");
        capturedChunks[0].Metadata["FileName"].Should().Be("process.md");
        _llmGatewayMock.Verify(g => g.GenerateEmbeddingAsync(
            It.Is<string>(text => !string.IsNullOrWhiteSpace(text)),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
