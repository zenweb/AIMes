using System.Security.Claims;
using FluentAssertions;
using MES.Api.Filters;
using MES.Application.Services;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace MES.Tests.Unit.Filters;

public sealed class AuditEndpointFilterTests
{
    [Fact]
    public async Task Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork()
    {
        var auditLog = new Mock<IAuditLogAppService>(MockBehavior.Strict);
        var unitOfWork = new Mock<IUnitOfWork>(MockBehavior.Strict);
        var services = new ServiceCollection();
        services.AddSingleton(auditLog.Object);
        services.AddSingleton(unitOfWork.Object);

        unitOfWork
            .Setup(u => u.ExecuteAsync(
                It.IsAny<Func<CancellationToken, Task>>(),
                It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

        auditLog
            .Setup(a => a.WriteAuditLogAsync(
                "user-123",
                "POST",
                "employee",
                "employee-001",
                null,
                It.Is<string?>(value => value != null && value.Contains("EMP-AUD-001", StringComparison.Ordinal)),
                It.IsAny<string?>(),
                "UnitTestAgent/1.0",
                AuditInitiatedBy.User,
                It.IsAny<CancellationToken>(),
                "employee:employee-001",
                "trace-http-001",
                null,
                null))
            .Returns(Task.CompletedTask);

        var httpContext = new DefaultHttpContext
        {
            RequestServices = services.BuildServiceProvider(),
            User = new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, "user-123"),
            ]))
        };
        httpContext.Request.Method = HttpMethods.Post;
        httpContext.TraceIdentifier = "trace-http-001";
        httpContext.Request.RouteValues["id"] = "employee-001";
        httpContext.Request.Headers.UserAgent = "UnitTestAgent/1.0";
        httpContext.Request.Headers["X-Initiated-By"] = "Agent";

        var filter = new AuditEndpointFilter("employee");
        var payload = new { EmployeeNumber = "EMP-AUD-001", Name = "Audit Employee" };
        var context = new TestEndpointFilterInvocationContext(httpContext, [payload, CancellationToken.None]);
        var nextCalled = false;

        var result = await filter.InvokeAsync(
            context,
            _ =>
            {
                nextCalled = true;
                return ValueTask.FromResult<object?>("next-result");
            });

        result.Should().Be("next-result");
        nextCalled.Should().BeTrue();
        unitOfWork.Verify(u => u.ExecuteAsync(
            It.IsAny<Func<CancellationToken, Task>>(),
            httpContext.RequestAborted), Times.Once);
        auditLog.Verify(a => a.WriteAuditLogAsync(
            "user-123",
            "POST",
            "employee",
            "employee-001",
            null,
            It.Is<string?>(value => value != null && value.Contains("EMP-AUD-001", StringComparison.Ordinal)),
            It.IsAny<string?>(),
            "UnitTestAgent/1.0",
            AuditInitiatedBy.User,
            It.IsAny<CancellationToken>(),
            "employee:employee-001",
            "trace-http-001",
            null,
            null), Times.Once);
    }

    private sealed class TestEndpointFilterInvocationContext(
        HttpContext httpContext,
        IList<object?> arguments) : EndpointFilterInvocationContext
    {
        public override HttpContext HttpContext { get; } = httpContext;

        public override IList<object?> Arguments { get; } = arguments;

        public override T GetArgument<T>(int index) => (T)Arguments[index]!;
    }
}
