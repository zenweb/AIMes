using FluentAssertions;
using MES.Api.Filters;
using Xunit;

namespace MES.Tests.Unit.Security;

public sealed class AuditRedactionTests
{
    [Fact]
    public void RedactAndSerialize_ShouldMaskNestedSensitiveFields()
    {
        var payload = new
        {
            Username = "operator",
            Password = "plain-password",
            Profile = new
            {
                ApiKey = "api-key-value",
                SecretToken = "secret-token-value"
            }
        };

        var json = AuditRedaction.RedactAndSerialize([payload]);

        json.Should().NotBeNull();
        json.Should().Contain("***REDACTED***", "audit logs must retain context while removing credential material");
        json.Should().NotContain("plain-password");
        json.Should().NotContain("api-key-value");
        json.Should().NotContain("secret-token-value");
        json.Should().Contain("operator");
    }
}
