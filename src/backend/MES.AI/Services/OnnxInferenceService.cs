using System.Collections.Concurrent;
using MES.AI.Pro.Configuration;
using MES.Domain.Interfaces.Services;
using Microsoft.Extensions.Options;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace MES.AI.Pro.Services;

/// <summary>
/// ONNX推理服务实现。
/// 注册为 Singleton（缓存 InferenceSession 避免反复加载几秒级的 ONNX 模型）。
/// 内部用 ConcurrentDictionary + 加载时 Lazy 模式确保多线程安全。
/// </summary>
public class OnnxInferenceService : IOnnxModelService, IDisposable
{
    private readonly ConcurrentDictionary<string, Lazy<InferenceSession>> _loadedModels = new();
    private readonly OnnxConfig _config;
    private bool _disposed;

    public OnnxInferenceService(IOptions<OnnxConfig> config)
    {
        _config = config.Value;
    }

    public async Task<float[]> PredictAsync(string modelName, float[] input, CancellationToken ct = default)
    {
        var session = await GetOrLoadModelAsync(modelName, ct);

        var inputTensor = new DenseTensor<float>(input, new[] { 1, input.Length });
        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor("input", inputTensor)
        };

        using var results = session.Run(inputs);
        var output = results.FirstOrDefault();

        if (output == null)
            throw new InvalidOperationException("Model output is null");

        return output.AsEnumerable<float>().ToArray();
    }

    public async Task<Dictionary<string, float>> PredictMultiClassAsync(string modelName, float[] input, CancellationToken ct = default)
    {
        var session = await GetOrLoadModelAsync(modelName, ct);

        var inputTensor = new DenseTensor<float>(input, new[] { 1, input.Length });
        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor("input", inputTensor)
        };

        using var results = session.Run(inputs);
        var output = results.FirstOrDefault();

        if (output == null)
            throw new InvalidOperationException("Model output is null");

        var labels = _config.Models.GetValueOrDefault(modelName)?.Labels ?? new List<string>();
        var probabilities = output.AsEnumerable<float>().ToArray();

        var result = new Dictionary<string, float>();
        for (int i = 0; i < probabilities.Length && i < labels.Count; i++)
        {
            result[labels[i]] = probabilities[i];
        }

        return result;
    }

    public async Task<bool> LoadModelAsync(string modelName, CancellationToken ct = default)
    {
        var session = await GetOrLoadModelAsync(modelName, ct);
        return session != null;
    }

    public Task UnloadModelAsync(string modelName)
    {
        if (_loadedModels.TryRemove(modelName, out var lazy) && lazy.IsValueCreated)
        {
            lazy.Value.Dispose();
        }
        return Task.CompletedTask;
    }

    private Task<InferenceSession> GetOrLoadModelAsync(string modelName, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var lazy = _loadedModels.GetOrAdd(modelName, key =>
            new Lazy<InferenceSession>(() =>
            {
                var modelConfig = _config.Models.GetValueOrDefault(key)
                    ?? throw new ArgumentException($"Model configuration not found for: {key}");
                return new InferenceSession(modelConfig.Path);
            }, LazyThreadSafetyMode.ExecutionAndPublication));

        try
        {
            return Task.FromResult(lazy.Value);
        }
        catch
        {
            // Lazy<T> 在 ExecutionAndPublication 模式下会缓存异常 —— 后续访问总是抛同一个错。
            // 这里在拿到第一次失败时移除条目，让下次调用能重新尝试加载（例如修复模型文件后无需重启）。
            _loadedModels.TryRemove(new KeyValuePair<string, Lazy<InferenceSession>>(modelName, lazy));
            throw;
        }
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            foreach (var lazy in _loadedModels.Values)
            {
                if (lazy.IsValueCreated)
                {
                    lazy.Value.Dispose();
                }
            }
            _loadedModels.Clear();
            _disposed = true;
        }
    }
}
