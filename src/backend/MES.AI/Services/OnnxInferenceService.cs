using MES.AI.Pro.Configuration;
using MES.Domain.Interfaces.Services;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace MES.AI.Pro.Services;

/// <summary>
/// ONNX推理服务实现
/// </summary>
public class OnnxInferenceService : IOnnxModelService, IDisposable
{
    private readonly Dictionary<string, InferenceSession> _loadedModels = new();
    private readonly OnnxConfig _config;
    private bool _disposed;

    public OnnxInferenceService(OnnxConfig config)
    {
        _config = config;
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

    public Task<bool> LoadModelAsync(string modelName, CancellationToken ct = default)
    {
        return GetOrLoadModelAsync(modelName, ct).ContinueWith(t => t.Result != null, ct);
    }

    public Task UnloadModelAsync(string modelName)
    {
        if (_loadedModels.ContainsKey(modelName))
        {
            _loadedModels[modelName].Dispose();
            _loadedModels.Remove(modelName);
        }
        return Task.CompletedTask;
    }

    private Task<InferenceSession> GetOrLoadModelAsync(string modelName, CancellationToken ct)
    {
        if (_loadedModels.TryGetValue(modelName, out var existingSession))
        {
            return Task.FromResult(existingSession);
        }

        var modelConfig = _config.Models.GetValueOrDefault(modelName);
        if (modelConfig == null)
            throw new ArgumentException($"Model configuration not found for: {modelName}");

        var session = new InferenceSession(modelConfig.Path);
        _loadedModels[modelName] = session;

        return Task.FromResult(session);
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            foreach (var session in _loadedModels.Values)
            {
                session.Dispose();
            }
            _loadedModels.Clear();
            _disposed = true;
        }
    }
}
