namespace MES.Domain.Interfaces.Services;

/// <summary>
/// ONNX模型推理服务接口
/// </summary>
public interface IOnnxModelService
{
    Task<float[]> PredictAsync(string modelName, float[] input, CancellationToken ct = default);
    Task<Dictionary<string, float>> PredictMultiClassAsync(string modelName, float[] input, CancellationToken ct = default);
    Task<bool> LoadModelAsync(string modelName, CancellationToken ct = default);
    Task UnloadModelAsync(string modelName);
}