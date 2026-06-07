namespace MES.AI.Pro.Services;

public interface ILlmConcurrencyGate
{
    Task<T> RunAsync<T>(Func<CancellationToken, Task<T>> operation, CancellationToken ct = default);
}

public sealed class LlmConcurrencyGate : ILlmConcurrencyGate, IDisposable
{
    private readonly SemaphoreSlim _semaphore;

    public LlmConcurrencyGate(int maxConcurrency)
    {
        if (maxConcurrency <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(maxConcurrency), "LLM concurrency must be greater than zero.");
        }

        _semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
    }

    public async Task<T> RunAsync<T>(Func<CancellationToken, Task<T>> operation, CancellationToken ct = default)
    {
        await _semaphore.WaitAsync(ct);
        try
        {
            return await operation(ct);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public void Dispose()
    {
        _semaphore.Dispose();
    }
}
