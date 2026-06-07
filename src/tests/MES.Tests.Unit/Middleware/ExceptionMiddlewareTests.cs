using FluentAssertions;
using MES.Api.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace MES.Tests.Unit.Middleware;

public sealed class ExceptionMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails()
    {
        var context = new DefaultHttpContext();
        await using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;
        var middleware = new ExceptionMiddleware(
            _ => throw new OperationCanceledException("request canceled"),
            NullLogger<ExceptionMiddleware>.Instance,
            new FakeHostEnvironment(Environments.Development));

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(499, "request cancellation is not an application fault");
        context.Response.ContentType.Should().BeNull();
        responseBody.Length.Should().Be(0);
    }

    private sealed class FakeHostEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;
        public string ApplicationName { get; set; } = "MES.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
