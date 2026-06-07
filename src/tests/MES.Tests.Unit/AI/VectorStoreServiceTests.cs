using FluentAssertions;
using MES.AI.Pro.Services;

namespace MES.Tests.Unit.AI;

public class VectorStoreServiceTests
{
    [Fact]
    public async Task StoreAsync_WhenCancellationRequested_DoesNotStoreDocument()
    {
        var service = new VectorStoreService();
        using var cts = new CancellationTokenSource();
        await cts.CancelAsync();

        var act = () => service.StoreAsync(
            "knowledge-documents",
            "doc-1",
            "设备操作规程",
            [0.1f, 0.2f],
            new Dictionary<string, string>(),
            cts.Token);

        await act.Should().ThrowAsync<OperationCanceledException>();
        var results = await service.SearchAsync("knowledge-documents", [0.1f, 0.2f]);
        results.Should().BeEmpty();
    }
}
