using System.Diagnostics;
using System.Text.Json;
using MES.AI.Pro.Models;
using MES.AI.Pro.Services;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Pro.Agents;

public class KnowledgeAgent
{
    private const string AgentName = nameof(KnowledgeAgent);
    private const string AgentVersion = "1.0.0-phase1c";
    private const string CollectionName = "knowledge-documents";

    private readonly ILlmGateway _llmGateway;
    private readonly IVectorStoreService _vectorStore;

    public KnowledgeAgent(ILlmGateway llmGateway, IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _vectorStore = vectorStore;
    }

    public async Task<KnowledgeAnswer> AnswerQuestionAsync(
        string question,
        int topK = 5,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var modelName = "KnowledgeRag";
        string retrievalError = string.Empty;
        List<DocumentChunk> sources;
        try
        {
            sources = await FindSimilarDocumentsAsync(question, topK, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            modelName = "KnowledgeRagFallback";
            retrievalError = $"检索失败（{ex.GetType().Name}），无法读取知识库上下文。";
            sources = [];
        }

        var context = JsonSerializer.Serialize(sources.Select(s => new { s.Id, s.Content, s.Source, s.Metadata }));
        var prompt = AiPromptBudget.Bound($"""
            请基于以下MES知识库上下文回答问题。若上下文不足，请明确说明缺口。

            问题：{question}

            知识库上下文：
            {context}
            """);

        string answer;
        if (!string.IsNullOrEmpty(retrievalError))
        {
            answer = retrievalError;
        }
        else
        {
            try
            {
                answer = await _llmGateway.GenerateTextAsync(prompt, ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                modelName = "KnowledgeRagFallback";
                answer = $"LLM 调用失败（{ex.GetType().Name}），请先查看已检索到的知识库来源。";
            }
        }

        return new KnowledgeAnswer
        {
            Answer = answer,
            Sources = sources,
            AiDecisionTrace = AiTraceFactory.Create(
                AgentName,
                AgentVersion,
                "ConfiguredLlmGateway",
                modelName,
                "unknown",
                prompt,
                context,
                $"question={question};topK={topK}",
                $"answerLength={answer.Length};sources={sources.Count}",
                sources.Count == 0 ? 0.55m : 0.82m,
                AiTraceFactory.EstimateTokens(prompt),
                AiTraceFactory.EstimateTokens(answer),
                (int)sw.ElapsedMilliseconds,
                CollectionName,
                $"query={question}")
        };
    }

    public async Task<DocumentChunk> IndexDocumentAsync(
        string id,
        string text,
        Dictionary<string, string> metadata,
        CancellationToken ct = default)
    {
        var embedding = await _llmGateway.GenerateEmbeddingAsync(text, ct);
        var chunk = new DocumentChunk
        {
            Id = id,
            Content = text,
            Metadata = metadata,
            Vector = embedding,
            Source = metadata.TryGetValue("source", out var source) ? source : id,
            CreatedAt = DateTime.UtcNow
        };

        await _vectorStore.UpsertAsync(CollectionName, new[] { chunk }, ct);
        return chunk;
    }

    public async Task<List<DocumentChunk>> FindSimilarDocumentsAsync(
        string query,
        int topK = 5,
        CancellationToken ct = default)
    {
        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        return await _vectorStore.SearchAsync(CollectionName, embedding, topK, ct);
    }
}
