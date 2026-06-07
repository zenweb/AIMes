using System.ComponentModel.DataAnnotations;

namespace MES.Api.Configuration;

public sealed class QdrantHealthOptions
{
    public const string SectionName = "AI:VectorStore";

    [Required]
    public string Provider { get; set; } = "InMemory";

    [Required]
    public QdrantEndpointOptions Qdrant { get; set; } = new();

    public string Host => Qdrant.Host;

    public int Port => Qdrant.Port;

    public string? ApiKey => Qdrant.ApiKey;

    public bool IsQdrantEnabled =>
        string.Equals(Provider, "Qdrant", StringComparison.OrdinalIgnoreCase);

    public static bool HasValidEndpoint(QdrantHealthOptions options)
    {
        return !options.IsQdrantEnabled
            || (!string.IsNullOrWhiteSpace(options.Host) && options.Port is >= 1 and <= 65535);
    }
}

public sealed class QdrantEndpointOptions
{
    [Required]
    public string Host { get; set; } = "localhost";

    [Range(1, 65535)]
    public int Port { get; set; } = 6333;

    public string? ApiKey { get; set; }
}
