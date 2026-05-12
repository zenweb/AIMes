namespace MES.AI.Configuration;

/// <summary>
/// 向量数据库配置
/// </summary>
public class VectorStoreConfig
{
    public string Provider { get; set; } = "Qdrant"; // Qdrant, PostgreSQL, InMemory
    public QdrantConfig Qdrant { get; set; } = new();
    public PostgreSqlConfig PostgreSQL { get; set; } = new();
}

public class QdrantConfig
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 6333;
    public string? ApiKey { get; set; }
}

public class PostgreSqlConfig
{
    public string ConnectionString { get; set; } = string.Empty;
}