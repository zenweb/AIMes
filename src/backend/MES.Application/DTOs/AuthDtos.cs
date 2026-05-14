namespace MES.Application.DTOs;

public record LoginRequestDto(string Username, string Password);
public record LoginResponseDto(string Token, string RefreshToken, string Username, string DisplayName, string Role, DateTime ExpiresAt);
public record RefreshTokenRequestDto(string RefreshToken);
public record RefreshTokenResponseDto(string Token, string RefreshToken, DateTime ExpiresAt);
public record RevokeUserRequestDto(string Username);
