using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Services;
using MES.AI.Pro.Services;

namespace MES.Application.Services;

/// <summary>
/// 知识库应用服务接口
/// </summary>
public interface IKnowledgeAppService
{
    Task<KnowledgeQueryResponse> QueryAsync(KnowledgeQueryRequest request, CancellationToken ct = default);
    Task<DocumentUploadResponse> UploadDocumentAsync(Stream documentStream, string fileName, string? category = null, CancellationToken ct = default);
    Task<ChatHistoryResponse> GetChatHistoryAsync(string sessionId, int maxMessages = 20, CancellationToken ct = default);
}

/// <summary>
/// 知识库应用服务实现
/// </summary>
public class KnowledgeAppService : IKnowledgeAppService
{
    private readonly ILlmGateway _llmGateway;
    private readonly IVectorStoreService _vectorStore;
    private readonly Dictionary<string, List<ChatMessage>> _chatHistories = new();

    private const string KnowledgeCollectionName = "mes-knowledge";

    public KnowledgeAppService(ILlmGateway llmGateway, IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _vectorStore = vectorStore;
    }

    public async Task<KnowledgeQueryResponse> QueryAsync(KnowledgeQueryRequest request, CancellationToken ct = default)
    {
        // 1. 生成问题的向量嵌入
        var embedding = await _llmGateway.GenerateEmbeddingAsync(request.Question, ct);

        // 2. 向量检索相关文档
        var relevantChunks = await _vectorStore.SearchAsync(KnowledgeCollectionName, embedding, request.TopK);

        // 3. 构建上下文
        var context = string.Join("\n\n", relevantChunks.Select(c => c.Content));

        // 4. 构建提示词
        var systemPrompt = """
            你是AIMes系统的智能助手。你的职责是：
            1. 回答用户关于MES系统操作的问题
            2. 提供工艺标准、质量要求等信息
            3. 辅助用户进行故障诊断

            回答要求：
            - 基于提供的知识库内容回答
            - 如果知识库没有相关信息，明确告知用户
            - 回答要简洁、专业、易懂
            - 必要时可以提供操作步骤
            """;

        var prompt = $"""
            {systemPrompt}

            知识库内容：
            {context}

            用户问题：{request.Question}

            请回答用户问题：
            """;

        // 5. 调用LLM生成回答
        var answer = await _llmGateway.GenerateTextAsync(prompt, ct);

        // 6. 保存聊天历史
        var sessionId = request.SessionId ?? Guid.NewGuid().ToString();
        SaveChatHistory(sessionId, request.Question, answer, relevantChunks);

        return new KnowledgeQueryResponse
        {
            Answer = answer,
            SessionId = sessionId,
            Sources = relevantChunks.Select(c => new KnowledgeSourceDto
            {
                SourceId = c.Id,
                SourceName = c.Source,
                Content = c.Content.Length > 200 ? c.Content.Substring(0, 200) + "..." : c.Content,
                RelevanceScore = 0.85 // 简化版本
            }).ToList(),
            Confidence = relevantChunks.Any() ? 0.85 : 0.5,
            Timestamp = DateTime.UtcNow
        };
    }

    public async Task<DocumentUploadResponse> UploadDocumentAsync(Stream documentStream, string fileName, string? category = null, CancellationToken ct = default)
    {
        // 1. 读取文档内容（简化版本）
        using var reader = new StreamReader(documentStream);
        var content = await reader.ReadToEndAsync(ct);

        // 2. 分块处理
        var chunks = SplitIntoChunks(content, fileName);

        // 3. 生成向量嵌入
        var chunkEntities = new List<DocumentChunk>();
        foreach (var chunk in chunks)
        {
            var embedding = await _llmGateway.GenerateEmbeddingAsync(chunk, ct);
            chunkEntities.Add(new DocumentChunk
            {
                Id = Guid.NewGuid().ToString(),
                Content = chunk,
                Source = fileName,
                Vector = embedding,
                Metadata = new Dictionary<string, string>
                {
                    { "Category", category ?? "General" },
                    { "FileName", fileName }
                }
            });
        }

        // 4. 存储到向量数据库
        await _vectorStore.UpsertAsync(KnowledgeCollectionName, chunkEntities);

        return new DocumentUploadResponse
        {
            DocumentId = Guid.NewGuid().ToString(),
            FileName = fileName,
            ChunkCount = chunkEntities.Count,
            UploadedAt = DateTime.UtcNow,
            Status = "Success"
        };
    }

    public Task<ChatHistoryResponse> GetChatHistoryAsync(string sessionId, int maxMessages = 20, CancellationToken ct = default)
    {
        if (!_chatHistories.TryGetValue(sessionId, out var history))
        {
            return Task.FromResult(new ChatHistoryResponse
            {
                SessionId = sessionId,
                Messages = new List<ChatMessageDto>(),
                TotalCount = 0
            });
        }

        var messages = history
            .OrderByDescending(m => m.Timestamp)
            .Take(maxMessages)
            .OrderBy(m => m.Timestamp)
            .Select(m => new ChatMessageDto
            {
                Role = m.Role,
                Content = m.Content,
                Timestamp = m.Timestamp,
                SourceIds = m.SourceDocumentIds
            })
            .ToList();

        return Task.FromResult(new ChatHistoryResponse
        {
            SessionId = sessionId,
            Messages = messages,
            TotalCount = history.Count
        });
    }

    #region Private Methods

    private List<string> SplitIntoChunks(string content, string source)
    {
        const int chunkSize = 1000;
        const int overlap = 200;

        var chunks = new List<string>();
        var position = 0;

        while (position < content.Length)
        {
            var end = Math.Min(position + chunkSize, content.Length);

            // 尝试在句子边界处分割
            if (end < content.Length)
            {
                var lastPeriod = content.LastIndexOf('。', end);
                var lastNewline = content.LastIndexOf('\n', end);
                var lastSpace = content.LastIndexOf(' ', end);

                var breakPoint = Math.Max(Math.Max(lastPeriod, lastNewline), lastSpace);
                if (breakPoint > position + chunkSize / 2)
                {
                    end = breakPoint + 1;
                }
            }

            chunks.Add(content.Substring(position, end - position).Trim());
            position = end - overlap;

            if (position < 0) position = 0;
        }

        return chunks;
    }

    private void SaveChatHistory(string sessionId, string question, string answer, List<DocumentChunk> sources)
    {
        if (!_chatHistories.ContainsKey(sessionId))
        {
            _chatHistories[sessionId] = new List<ChatMessage>();
        }

        _chatHistories[sessionId].Add(new ChatMessage
        {
            SessionId = sessionId,
            Role = "user",
            Content = question,
            Timestamp = DateTime.UtcNow
        });

        _chatHistories[sessionId].Add(new ChatMessage
        {
            SessionId = sessionId,
            Role = "assistant",
            Content = answer,
            Timestamp = DateTime.UtcNow,
            SourceDocumentIds = sources.Select(s => s.Id).ToList()
        });
    }

    #endregion
}
