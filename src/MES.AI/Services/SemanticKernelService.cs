using Microsoft.SemanticKernel;

namespace MES.AI.Pro.Services;

/// <summary>
/// Semantic Kernel服务
/// </summary>
public class SemanticKernelService
{
    private readonly Kernel _kernel;

    public SemanticKernelService(Kernel kernel)
    {
        _kernel = kernel;
    }

    public Kernel GetKernel() => _kernel;

    public async Task<string> InvokePromptAsync(string prompt, CancellationToken ct = default)
    {
        var result = await _kernel.InvokePromptAsync<string>(prompt, cancellationToken: ct);
        return result ?? string.Empty;
    }

    public async Task<T> InvokePromptAsync<T>(string prompt, KernelArguments? arguments = null, CancellationToken ct = default) where T : class
    {
        var result = await _kernel.InvokePromptAsync<T>(prompt, arguments, cancellationToken: ct);
        return result ?? throw new InvalidOperationException("Failed to get result from Semantic Kernel");
    }

    public void AddSkillFromType<T>()
    {
        _kernel.Plugins.AddFromType<T>();
    }

    public void AddSkillFromType<T>(string pluginName)
    {
        _kernel.Plugins.AddFromType<T>(pluginName);
    }

    public void AddPromptFunction(string functionName, string promptTemplate, string? description = null)
    {
        var function = KernelFunctionFactory.CreateFromPrompt(
            promptTemplate,
            functionName: functionName,
            description: description ?? functionName);
        _kernel.Plugins.AddFromFunctions("Custom", [function]);
    }
}
