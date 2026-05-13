using MES.AI.Pro.Configuration;
using MES.AI.Pro.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

/// <summary>
/// LLM 状态管理控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class LlmController : ControllerBase
{
    private readonly ILlmGateway _llmGateway;
    private readonly LlmConfig _config;

    public LlmController(ILlmGateway llmGateway, LlmConfig config)
    {
        _llmGateway = llmGateway;
        _config = config;
    }

    /// <summary>
    /// 获取 LLM 状态（提供者、模型、连通性）
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LlmStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<LlmStatusDto>> GetStatus(CancellationToken ct)
    {
        var status = await _llmGateway.GetStatusAsync(ct);
        return Ok(status);
    }

    /// <summary>
    /// 获取 LLM 配置信息（不含密钥）
    /// </summary>
    [HttpGet("config")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult GetConfig()
    {
        return Ok(new
        {
            _config.Provider,
            Ollama = new
            {
                BaseUrl = _config.Ollama.BaseUrl,
                Model = _config.Ollama.Model,
            },
            AzureOpenAI = new
            {
                Endpoint = _config.AzureOpenAI.Endpoint,
                DeploymentName = _config.AzureOpenAI.DeploymentName,
            },
            OpenAI = new
            {
                ModelId = _config.OpenAI.ModelId,
            },
        });
    }
}
