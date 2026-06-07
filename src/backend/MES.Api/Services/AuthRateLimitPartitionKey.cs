namespace MES.Api.Services;

public static class AuthRateLimitPartitionKey
{
    public static string Create(string? remoteIp, string? username)
    {
        var ipPart = string.IsNullOrWhiteSpace(remoteIp) ? "unknown" : remoteIp.Trim();
        var usernamePart = string.IsNullOrWhiteSpace(username) ? "unknown" : username.Trim().ToLowerInvariant();
        return $"{ipPart}|{usernamePart}";
    }
}
