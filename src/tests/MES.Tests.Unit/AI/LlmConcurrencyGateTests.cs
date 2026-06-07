using FluentAssertions;
using MES.AI.Pro.Services;

namespace MES.Tests.Unit.AI;

public class LlmConcurrencyGateTests
{
    [Fact]
    public async Task RunAsync_WhenConcurrencyIsFull_QueuesUntilPreviousOperationCompletes()
    {
        var gate = new LlmConcurrencyGate(1);
        var firstEntered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var releaseFirst = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var secondEntered = false;

        var first = gate.RunAsync(async ct =>
        {
            firstEntered.SetResult();
            await releaseFirst.Task.WaitAsync(ct);
            return "first";
        });
        await firstEntered.Task;

        var second = gate.RunAsync(ct =>
        {
            secondEntered = true;
            return Task.FromResult("second");
        });

        await Task.Delay(50);
        secondEntered.Should().BeFalse("LLM calls beyond the configured global gate must wait instead of running concurrently");

        releaseFirst.SetResult();

        (await first).Should().Be("first");
        (await second).Should().Be("second");
        secondEntered.Should().BeTrue();
    }

    [Fact]
    public async Task RunAsync_WhenWaitingCancellationIsRequested_ThrowsOperationCanceledException()
    {
        var gate = new LlmConcurrencyGate(1);
        var firstEntered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var releaseFirst = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var first = gate.RunAsync(async ct =>
        {
            firstEntered.SetResult();
            await releaseFirst.Task.WaitAsync(ct);
            return "first";
        });
        await firstEntered.Task;

        using var cts = new CancellationTokenSource();
        await cts.CancelAsync();

        Func<Task> act = async () => await gate.RunAsync(_ => Task.FromResult("second"), cts.Token);

        await act.Should().ThrowAsync<OperationCanceledException>();

        releaseFirst.SetResult();
        (await first).Should().Be("first");
    }
}
