namespace MES.AI.Pro.Configuration;

/// <summary>
/// ONNX模型配置
/// </summary>
public class OnnxConfig
{
    public Dictionary<string, OnnxModelConfig> Models { get; set; } = new();
}

public class OnnxModelConfig
{
    public string Path { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public int InputSize { get; set; } = 224;
}
