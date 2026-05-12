using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

/// <summary>
/// 知识库控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class KnowledgeController : ControllerBase
{
    private readonly IKnowledgeAppService _knowledgeService;

    public KnowledgeController(IKnowledgeAppService knowledgeService)
    {
        _knowledgeService = knowledgeService;
    }

    /// <summary>
    /// 智能问答
    /// </summary>
    [HttpPost("query")]
    [Audit]
    [ProducesResponseType(typeof(KnowledgeQueryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KnowledgeQueryResponse>> Query(
        [FromBody] KnowledgeQueryRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var response = await _knowledgeService.QueryAsync(request, ct);
        return Ok(response);
    }

    /// <summary>
    /// 上传文档到知识库
    /// </summary>
    [HttpPost("documents")]
    [Audit]
    [ProducesResponseType(typeof(DocumentUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DocumentUploadResponse>> UploadDocument(
        IFormFile file,
        [FromForm] string? category,
        CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest("请选择要上传的文件");

        using var stream = file.OpenReadStream();
        var response = await _knowledgeService.UploadDocumentAsync(stream, file.FileName, category, ct);
        return Ok(response);
    }

    /// <summary>
    /// 获取聊天历史
    /// </summary>
    [HttpGet("chat-history/{sessionId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ChatHistoryResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ChatHistoryResponse>> GetChatHistory(
        string sessionId,
        [FromQuery] int maxMessages = 20,
        CancellationToken ct = default)
    {
        var history = await _knowledgeService.GetChatHistoryAsync(sessionId, maxMessages, ct);
        return Ok(history);
    }
}
