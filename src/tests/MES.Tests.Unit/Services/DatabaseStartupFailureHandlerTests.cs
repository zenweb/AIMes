using FluentAssertions;
using MES.Api.Services;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace MES.Tests.Unit.Services;

public sealed class DatabaseStartupFailureHandlerTests : IDisposable
{
    private readonly int _originalExitCode = Environment.ExitCode;

    [Fact]
    public void Handle_WhenProductionDatabaseStartupFails_ShouldSetExitCodeAndRethrow()
    {
        Environment.ExitCode = 0;
        var environment = new FakeHostEnvironment(Environments.Production);
        var exception = new InvalidOperationException("database unavailable");

        var shouldRethrow = DatabaseStartupFailureHandler.Handle(
            exception,
            environment,
            NullLogger.Instance);

        shouldRethrow.Should().BeTrue("Production cannot run without database connectivity");
        Environment.ExitCode.Should().Be(1);
    }

    [Fact]
    public void Handle_WhenDevelopmentDatabaseStartupFails_ShouldContinueWithoutExitCode()
    {
        Environment.ExitCode = 0;
        var environment = new FakeHostEnvironment(Environments.Development);
        var exception = new InvalidOperationException("database unavailable");

        var shouldRethrow = DatabaseStartupFailureHandler.Handle(
            exception,
            environment,
            NullLogger.Instance);

        shouldRethrow.Should().BeFalse("Development may run in no-persistence demo mode");
        Environment.ExitCode.Should().Be(0);
    }

    public void Dispose()
    {
        Environment.ExitCode = _originalExitCode;
    }

    private sealed class FakeHostEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;
        public string ApplicationName { get; set; } = "MES.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
