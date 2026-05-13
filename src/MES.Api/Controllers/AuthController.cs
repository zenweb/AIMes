using MES.Api.DTOs;
using MES.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace MES.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly SigningKeyStore _keyStore;
    private readonly TokenBlacklistService _blacklist;
    private static readonly ConcurrentDictionary<string, RefreshTokenEntry> _refreshTokens = new();
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    public AuthController(IConfiguration configuration, SigningKeyStore keyStore, TokenBlacklistService blacklist)
    {
        _configuration = configuration;
        _keyStore = keyStore;
        _blacklist = blacklist;
    }

    /// <summary>
    /// 用户登录
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("Auth")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { message = "用户名和密码不能为空" });

        var (valid, role, displayName) = ValidateUser(request.Username, request.Password);
        if (!valid)
            return Unauthorized(new { message = "用户名或密码错误" });

        var token = GenerateToken(request.Username, role!, displayName!, out var expiresAt);
        var refreshToken = GenerateRefreshToken();

        _refreshTokens[refreshToken] = new RefreshTokenEntry(
            request.Username, role!, displayName!, DateTime.UtcNow.Add(RefreshTokenLifetime));

        return Ok(new LoginResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            Username = request.Username,
            DisplayName = displayName!,
            Role = role!,
            ExpiresAt = expiresAt,
        });
    }

    /// <summary>
    /// 刷新令牌
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("Auth")]
    [ProducesResponseType(typeof(RefreshTokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Refresh([FromBody] RefreshTokenRequestDto request)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
            return BadRequest(new { message = "刷新令牌不能为空" });

        if (!_refreshTokens.TryRemove(request.RefreshToken, out var entry))
            return Unauthorized(new { message = "刷新令牌无效或已过期" });

        if (entry.ExpiresAt <= DateTime.UtcNow)
            return Unauthorized(new { message = "刷新令牌已过期" });

        var token = GenerateToken(entry.Username, entry.Role, entry.DisplayName, out var expiresAt);
        var newRefreshToken = GenerateRefreshToken();

        _refreshTokens[newRefreshToken] = entry with { ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime) };

        return Ok(new RefreshTokenResponseDto
        {
            Token = token,
            RefreshToken = newRefreshToken,
            ExpiresAt = expiresAt,
        });
    }

    /// <summary>
    /// 登出（撤销刷新令牌 + JWT 加入黑名单）
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Logout([FromBody] RefreshTokenRequestDto request)
    {
        // 移除刷新令牌
        if (!string.IsNullOrEmpty(request.RefreshToken))
            _refreshTokens.TryRemove(request.RefreshToken, out _);

        // 将当前 JWT 加入黑名单
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = User.FindFirst("exp")?.Value;
        if (jti != null)
        {
            var expiry = expClaim != null && long.TryParse(expClaim, out var expUnix)
                ? DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime
                : DateTime.UtcNow.AddHours(8);
            _blacklist.Blacklist(jti, expiry);
        }

        return Ok(new { message = "已登出" });
    }

    /// <summary>
    /// 强制撤销指定用户的全部令牌（管理员功能）
    /// </summary>
    [HttpPost("revoke-user")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult RevokeUserTokens([FromBody] RevokeUserRequestDto request)
    {
        // 移除该用户的所有 refresh token
        var userKeys = _refreshTokens
            .Where(kv => kv.Value.Username == request.Username)
            .Select(kv => kv.Key)
            .ToList();

        foreach (var key in userKeys)
            _refreshTokens.TryRemove(key, out _);

        return Ok(new { message = $"用户 {request.Username} 的所有令牌已撤销" });
    }

    /// <summary>
    /// 管理员手动触发密钥轮转
    /// </summary>
    [HttpPost("rotate-keys")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult RotateKeys()
    {
        var newKeyMaterial = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        _keyStore.Rotate(newKeyMaterial);
        return Ok(new { message = "密钥已轮转，旧密钥将在 24 小时后失效" });
    }

    private static (bool valid, string? role, string? displayName) ValidateUser(string username, string password)
    {
        var users = new Dictionary<string, (string Password, string Role, string DisplayName)>
        {
            ["admin"] = ("admin123", "Admin", "系统管理员"),
            ["operator"] = ("123456", "Operator", "张三"),
            ["engineer"] = ("123456", "Engineer", "李四"),
            ["lead"] = ("123456", "Lead", "王五"),
        };

        if (users.TryGetValue(username, out var user) && user.Password == password)
            return (true, user.Role, user.DisplayName);

        return (false, null, null);
    }

    private string GenerateToken(string username, string role, string displayName, out DateTime expiresAt)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var issuer = jwtSection["Issuer"] ?? "AIMes";
        var audience = jwtSection["Audience"] ?? "AIMes-Client";
        var (kid, key) = _keyStore.CurrentKey;

        expiresAt = DateTime.UtcNow.AddHours(8);
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

        // 设置 kid header
        token.Header["kid"] = kid;

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }

    internal sealed record RefreshTokenEntry(string Username, string Role, string DisplayName, DateTime ExpiresAt);
}
