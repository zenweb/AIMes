namespace MES.Application.DTOs;

public sealed record IntegrationEndpointDto(string Name, string SystemType, string Status, DateTime LastCheckedAt);
