using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class JwtStartupValidationTests
{
    [Fact]
    public void CreateClient_WithMissingSigningKey_ShouldRejectStartup()
    {
        using var signingKey = TemporaryEnvironmentVariable.Set("Jwt__SigningKey", "");
        using var factory = new WebApplicationFactory<Program>();

        var act = () => factory.CreateClient();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*Jwt:SigningKey*");
    }

    [Fact]
    public void CreateClient_WithSigningKeyShorterThan32Bytes_ShouldRejectStartup()
    {
        using var signingKey = TemporaryEnvironmentVariable.Set("Jwt__SigningKey", "short-key");
        using var factory = new WebApplicationFactory<Program>();

        var act = () => factory.CreateClient();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*32 bytes*");
    }

    private sealed class TemporaryEnvironmentVariable : IDisposable
    {
        private readonly string _name;
        private readonly string? _previousValue;

        private TemporaryEnvironmentVariable(string name, string? value)
        {
            _name = name;
            _previousValue = Environment.GetEnvironmentVariable(name);
            Environment.SetEnvironmentVariable(name, value);
        }

        public static TemporaryEnvironmentVariable Set(string name, string? value) => new(name, value);

        public void Dispose()
        {
            Environment.SetEnvironmentVariable(_name, _previousValue);
        }
    }
}
