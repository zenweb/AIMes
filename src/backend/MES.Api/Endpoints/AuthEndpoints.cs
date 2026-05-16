using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MES.Api.Filters;
using MES.Api.Services;
using MES.Application.DTOs;
using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace MES.Api.Endpoints;

public static class AuthEndpoints
{
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/login", LoginAsync)
             .WithTags("认证")
             .AddEndpointFilter<ValidationEndpointFilter>()
             .RequireRateLimiting("Auth");
        group.MapPost("/refresh", RefreshTokenAsync)
             .WithTags("认证")
             .AddEndpointFilter<ValidationEndpointFilter>()
             .RequireRateLimiting("Auth");
        group.MapPost("/logout", Logout).WithTags("认证").RequireAuthorization();
        group.MapPost("/revoke-user", RevokeUserTokensAsync).WithTags("认证").RequireAuthorization("Admin");
        group.MapPost("/rotate-keys", RotateKeys).WithTags("认证").RequireAuthorization("Admin");
        return group;
    }

    private static async Task<IResult> LoginAsync(
        LoginRequestDto request,
        IAuthService authService,
        SigningKeyStore keyStore,
        IConfiguration configuration,
        IRefreshTokenRepository refreshTokenRepo,
        CancellationToken ct)
    {
        var (valid, role, displayName) = await authService.ValidateAsync(request.Username, request.Password, ct);
        if (!valid)
            return TypedResults.Unauthorized();

        await authService.RecordLoginAsync(request.Username, ct);

        var (token, expiresAt) = GenerateToken(request.Username, role!, displayName!, keyStore, configuration);
        var refreshTokenStr = await CreateRefreshTokenAsync(request.Username, role!, displayName!, refreshTokenRepo, ct);

        return TypedResults.Ok(new LoginResponseDto(token, refreshTokenStr, request.Username, displayName!, role!, expiresAt));
    }

    private static async Task<IResult> RefreshTokenAsync(
        RefreshTokenRequestDto request,
        SigningKeyStore keyStore,
        IConfiguration configuration,
        IRefreshTokenRepository refreshTokenRepo,
        CancellationToken ct)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var stored = await refreshTokenRepo.GetByTokenAsync(tokenHash, ct);
        if (stored is null)
            return TypedResults.Unauthorized();

        if (stored.ExpiresAt <= DateTime.UtcNow)
        {
            await refreshTokenRepo.DeleteAsync(stored.Id, ct);
            return TypedResults.Unauthorized();
        }

        // 删除旧 token，签发新 token
        await refreshTokenRepo.DeleteAsync(stored.Id, ct);

        var (token, expiresAt) = GenerateToken(stored.Username, stored.Role, stored.DisplayName, keyStore, configuration);
        var newRefreshToken = await CreateRefreshTokenAsync(stored.Username, stored.Role, stored.DisplayName, refreshTokenRepo, ct);

        return TypedResults.Ok(new RefreshTokenResponseDto(token, newRefreshToken, expiresAt));
    }

    private static async Task<IResult> Logout(
        HttpContext httpContext,
        RefreshTokenRequestDto request,
        TokenBlacklistService blacklist,
        IRefreshTokenRepository refreshTokenRepo,
        CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            var tokenHash = HashToken(request.RefreshToken);
            var stored = await refreshTokenRepo.GetByTokenAsync(tokenHash, ct);
            if (stored is not null)
                await refreshTokenRepo.DeleteAsync(stored.Id, ct);
        }

        var jti = httpContext.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = httpContext.User.FindFirst("exp")?.Value;
        if (jti != null)
        {
            var expiry = expClaim != null && long.TryParse(expClaim, out var expUnix)
                ? DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime
                : DateTime.UtcNow.AddHours(8);
            await blacklist.BlacklistAsync(jti, expiry, ct);
        }

        return TypedResults.Ok(new { message = "已登出" });
    }

    private static async Task<IResult> RevokeUserTokensAsync(
        RevokeUserRequestDto request,
        IRefreshTokenRepository refreshTokenRepo,
        CancellationToken ct)
    {
        await refreshTokenRepo.DeleteByUsernameAsync(request.Username, ct);
        return TypedResults.Ok(new { message = $"用户 {request.Username} 的所有令牌已撤销" });
    }

    private static IResult RotateKeys(SigningKeyStore keyStore)
    {
        var newKeyMaterial = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        keyStore.Rotate(newKeyMaterial);
        return TypedResults.Ok(new { message = "密钥已轮转，旧密钥将在 24 小时后失效" });
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private static async Task<string> CreateRefreshTokenAsync(
        string username, string role, string displayName,
        IRefreshTokenRepository refreshTokenRepo, CancellationToken ct)
    {
        var tokenStr = GenerateRefreshTokenString();
        var entity = new RefreshToken
        {
            Token = HashToken(tokenStr),
            Username = username,
            Role = role,
            DisplayName = displayName,
            ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime),
        };
        await refreshTokenRepo.CreateAsync(entity, ct);
        return tokenStr;
    }

    private static (string Token, DateTime ExpiresAt) GenerateToken(
        string username, string role, string displayName, SigningKeyStore keyStore, IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var issuer = jwtSection["Issuer"] ?? "AIMes";
        var audience = jwtSection["Audience"] ?? "AIMes-Client";
        var (kid, key) = keyStore.CurrentKey;

        var expiresAt = DateTime.UtcNow.AddHours(8);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.GivenName, displayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        token.Header["kid"] = kid;

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private static string GenerateRefreshTokenString()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }
}
