using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class KnowledgeEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("knowledge");

    public static RouteGroupBuilder MapKnowledgeEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/query", QueryAsync)
             .WithTags("知识库")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/documents", UploadDocumentAsync)
             .WithTags("知识库")
             .RequireAuthorization()
             .AddEndpointFilter(Audit)
             .DisableAntiforgery();
        group.MapGet("/chat-history/{sessionId}", GetChatHistoryAsync).WithTags("知识库");
        return group;
    }

    private static async Task<IResult> QueryAsync(
        KnowledgeQueryRequest request,
        IKnowledgeAppService knowledgeService,
        CancellationToken ct)
    {
        var response = await knowledgeService.QueryAsync(request, ct);
        return TypedResults.Ok(response);
    }

    private static async Task<IResult> UploadDocumentAsync(
        HttpRequest request,
        IKnowledgeAppService knowledgeService,
        CancellationToken ct)
    {
        if (!request.HasFormContentType)
            return TypedResults.BadRequest(new { message = "请选择要上传的文件" });

        var form = await request.ReadFormAsync(ct);
        var file = form.Files.GetFile("file");
        if (file is null || file.Length == 0)
            return TypedResults.BadRequest(new { message = "请选择要上传的文件" });

        var category = form["category"].FirstOrDefault();
        await using var stream = file.OpenReadStream();
        var response = await knowledgeService.UploadDocumentAsync(stream, file.FileName, category, ct);
        return TypedResults.Ok(response);
    }

    private static async Task<IResult> GetChatHistoryAsync(
        string sessionId,
        IKnowledgeAppService knowledgeService,
        CancellationToken ct,
        int maxMessages = 20)
    {
        var history = await knowledgeService.GetChatHistoryAsync(sessionId, maxMessages, ct);
        return TypedResults.Ok(history);
    }
}
