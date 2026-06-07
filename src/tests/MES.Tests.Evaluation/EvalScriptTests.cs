using System.Diagnostics;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Evaluation;

public sealed class EvalScriptTests : IDisposable
{
    private readonly string _tempRoot = Path.Combine(Path.GetTempPath(), $"aimes-eval-{Guid.NewGuid():N}");

    [Fact]
    public async Task EvalScript_WhenGoldenDatasetIsMissing_ShouldFailClosed()
    {
        var evalDir = CopyEvaluationDirectory();
        File.Delete(Path.Combine(evalDir, "Data", "golden_quality.json"));

        var result = await RunEvalScriptAsync(evalDir);

        result.ExitCode.Should().NotBe(0);
        result.Output.Should().Contain("Missing golden dataset");
    }

    [Fact]
    public async Task EvalScript_WhenGoldenDatasetHasNoTestCases_ShouldFailClosed()
    {
        var evalDir = CopyEvaluationDirectory();
        var goldenPath = Path.Combine(evalDir, "Data", "golden_quality.json");
        var emptyGolden = new
        {
            agent = "QualityAgent",
            version = "1.0",
            description = "empty test dataset",
            testCases = Array.Empty<object>()
        };
        await File.WriteAllTextAsync(goldenPath, JsonSerializer.Serialize(emptyGolden));

        var result = await RunEvalScriptAsync(evalDir);

        result.ExitCode.Should().NotBe(0);
        result.Output.Should().Contain("contains no testCases");
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempRoot))
        {
            Directory.Delete(_tempRoot, recursive: true);
        }
    }

    private string CopyEvaluationDirectory()
    {
        var sourceDir = ResolveEvaluationDirectory();
        var targetDir = Path.Combine(_tempRoot, "src", "tests", "MES.Tests.Evaluation");
        Directory.CreateDirectory(targetDir);
        Directory.CreateDirectory(Path.Combine(targetDir, "Data"));

        File.Copy(Path.Combine(sourceDir, "eval.ps1"), Path.Combine(targetDir, "eval.ps1"));
        foreach (var file in Directory.GetFiles(Path.Combine(sourceDir, "Data"), "*.json"))
        {
            File.Copy(file, Path.Combine(targetDir, "Data", Path.GetFileName(file)));
        }

        return targetDir;
    }

    private static string ResolveEvaluationDirectory()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null)
        {
            var candidate = Path.Combine(current.FullName, "src", "tests", "MES.Tests.Evaluation", "eval.ps1");
            if (File.Exists(candidate))
            {
                return Path.GetDirectoryName(candidate)!;
            }

            current = current.Parent;
        }

        throw new DirectoryNotFoundException("Could not locate src/tests/MES.Tests.Evaluation.");
    }

    private static async Task<ScriptResult> RunEvalScriptAsync(string evalDir)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "pwsh",
            Arguments = "-NoProfile -ExecutionPolicy Bypass -File eval.ps1",
            WorkingDirectory = evalDir,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        using var process = Process.Start(startInfo)
            ?? throw new InvalidOperationException("Failed to start pwsh.");
        var stdout = await process.StandardOutput.ReadToEndAsync();
        var stderr = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        return new ScriptResult(process.ExitCode, stdout + stderr);
    }

    private sealed record ScriptResult(int ExitCode, string Output);
}
