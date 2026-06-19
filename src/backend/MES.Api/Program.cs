using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using MES.Api.Configuration;
using MES.Api.Endpoints;
using MES.Api.Extensions;
using MES.Api.Middleware;
using MES.Api.Services;
using MES.Application.Services;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using RabbitMQ.Client;
using Serilog;

// 全局结构化日志
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Serilog 接管 ASP.NET 日志
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName());

var isDevelopment = builder.Environment.IsDevelopment();
var aimesHostOptions = new AimesHostOptions();
AimesHostOptions.BindFromConfiguration(aimesHostOptions, builder.Configuration);
builder.Services.AddOptions<AimesHostOptions>()
    .Bind(builder.Configuration.GetSection(AimesHostOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .Validate(JwtOptions.HasValidSigningKey, "Jwt:SigningKey must be at least 32 bytes.")
    .ValidateOnStart();

// 密钥轮转 + Token 黑名单
builder.Services.AddSingleton<SigningKeyStore>(sp =>
    new SigningKeyStore(
        sp.GetRequiredService<IOptions<JwtOptions>>().Value.SigningKey,
        sp.GetRequiredService<IDistributedCache>()));
builder.Services.AddSingleton<TokenBlacklistService>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 速率限制 — 登录接口按 IP + username 分区，避免单个账号被同 IP 下其他账号挤占配额
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy<string>("Auth", context =>
    {
        var username = context.Items.TryGetValue(AuthRateLimitUsernameMiddleware.UsernameItemKey, out var value)
            ? value as string
            : null;
        var partitionKey = AuthRateLimitPartitionKey.Create(
            context.Connection.RemoteIpAddress?.ToString(),
            username);

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: partitionKey,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });
});

// 添加控制器（已迁移到 Minimal API 端点）
// 保留 AddAuthorization 等基础设施
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<SigningKeyStore, IOptions<JwtOptions>>((options, keyStore, jwtOptionsAccessor) =>
    {
        var jwtOptions = jwtOptionsAccessor.Value;
        options.RequireHttpsMetadata = !isDevelopment;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeyResolver = (_, _, kid, _) =>
            {
                if (kid is { Length: > 0 })
                {
                    var k = keyStore.GetKeyById(kid);
                    if (k != null) return [k];
                }
                return keyStore.GetAllValidKeys();
            },
            ValidateIssuer = !isDevelopment,
            ValidateAudience = !isDevelopment,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken)
                    && (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/monitoring")))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var jti = context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
                if (jti != null)
                {
                    var blacklist = context.HttpContext.RequestServices.GetRequiredService<TokenBlacklistService>();
                    if (await blacklist.IsBlacklistedAsync(jti, context.HttpContext.RequestAborted))
                    {
                        context.Fail("Token has been revoked");
                    }
                }
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Operator", policy => policy.RequireRole("Operator", "Lead", "Engineer", "Admin"));
    options.AddPolicy("Lead", policy => policy.RequireRole("Lead", "Engineer", "Admin"));
    options.AddPolicy("Engineer", policy => policy.RequireRole("Engineer", "Admin"));
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
});

// ForwardedHeaders：在反向代理（nginx/traefik/K8s ingress）后保留真实客户端 IP，
// 让 RateLimiter 的 IP partitioning 不会把整个工厂折叠成网关 IP。
// 默认关闭：直接暴露给客户端时若信任所有代理，攻击者可伪造 X-Forwarded-For 绕过 IP 限速。
// 生产部署在受信任反代后请显式开启 Aimes:TrustForwardedHeaders=true。
var trustForwarded = aimesHostOptions.TrustForwardedHeaders;
if (trustForwarded)
{
    builder.Services.Configure<Microsoft.AspNetCore.Builder.ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders =
            Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
            | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
        // 默认清空 known networks/proxies；允许任何代理转发头（适配 K8s ingress 多跳）。
        // 生产环境如需更严格信任，按部署拓扑增加 KnownProxies/KnownIPNetworks。
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    });
}

// 添加数据库服务
builder.Services.AddDatabaseServices(builder.Configuration);

// 添加仓储服务
builder.Services.AddRepositoryServices();

// 添加应用服务
builder.Services.AddApplicationServices();

// 添加验证服务
builder.Services.AddValidationServices();

// 添加AI服务
builder.Services.AddAIServices(builder.Configuration);

// 添加缓存服务
builder.Services.AddCacheServices(builder.Configuration);

// 添加消息总线服务
builder.Services.AddMessagingServices(builder.Configuration);

// SignalR 实时通知
builder.Services.AddSignalR();
builder.Services.AddScoped<MES.Api.Hubs.INotificationService, MES.Api.Hubs.NotificationService>();
builder.Services.AddSingleton<MES.Api.Services.IMonitoringSubscriberTracker, MES.Api.Services.MonitoringSubscriberTracker>();
builder.Services.AddHostedService<MES.Api.Services.MetricsBackgroundService>();
builder.Services.AddOptions<SchedulerAgentOptions>()
    .Bind(builder.Configuration.GetSection(SchedulerAgentOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddHostedService<MES.Application.Services.SchedulerAgentEventHandler>();
builder.Services.AddOptions<QdrantHealthOptions>()
    .Bind(builder.Configuration.GetSection(QdrantHealthOptions.SectionName))
    .ValidateDataAnnotations()
    .Validate(QdrantHealthOptions.HasValidEndpoint, "Qdrant Host and Port must be valid when Qdrant provider is enabled.")
    .ValidateOnStart();

// 添加跨域服务
builder.Services.AddCorsServices(builder.Configuration);

// Swagger 按 API 版本分组
builder.Services.AddSwaggerServices();

var databaseOptions = new DatabaseOptions();
DatabaseOptions.BindFromConfiguration(databaseOptions, builder.Configuration);
var healthDbConn = databaseOptions.DefaultConnection;
var healthDbProvider = databaseOptions.GetResolvedProvider();
var healthChecks = builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddCheck<StartupHealthCheck>("startup", tags: ["startup"]);

if (!isDevelopment && string.IsNullOrWhiteSpace(healthDbConn))
{
    throw new InvalidOperationException(
        "Production health checks require ConnectionStrings:DefaultConnection. " +
        "Set ConnectionStrings__DefaultConnection environment variable.");
}

if (DatabaseProvider.IsPostgreSql(healthDbProvider) && !string.IsNullOrWhiteSpace(healthDbConn))
{
    healthChecks.AddNpgSql(healthDbConn, name: "postgresql", tags: ["ready"]);
}

var cacheOptions = new CacheOptions();
CacheOptions.BindFromConfiguration(cacheOptions, builder.Configuration);
if (cacheOptions.HasRedisConnection)
{
    healthChecks.AddRedis(cacheOptions.RedisConnection, name: "redis", tags: ["ready"]);
}

var messagingOptions = new MessagingOptions();
MessagingOptions.BindFromConfiguration(messagingOptions, builder.Configuration);
if (messagingOptions.IsRabbitMq && !string.IsNullOrWhiteSpace(messagingOptions.RabbitMqConnection))
{
    var rabbitMqHealthConnection = new Lazy<Task<IConnection>>(() =>
    {
        var uriBuilder = new UriBuilder(messagingOptions.RabbitMqConnection);
        if (string.Equals(uriBuilder.Scheme, "rabbitmq", StringComparison.OrdinalIgnoreCase))
        {
            uriBuilder.Scheme = "amqp";
        }

        var factory = new ConnectionFactory
        {
            Uri = uriBuilder.Uri
        };
        return factory.CreateConnectionAsync();
    });
    healthChecks.AddRabbitMQ(_ => rabbitMqHealthConnection.Value, name: "rabbitmq", tags: ["ready"]);
}

healthChecks.AddCheck<QdrantHealthCheck>("qdrant", tags: ["ready"]);
// OpenTelemetry — 指标 + 链路追踪
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics =>
    {
        metrics.AddMeter("MES.Scheduling")
               .AddAspNetCoreInstrumentation()   // HTTP 请求速率/错误/耗时
               .AddHttpClientInstrumentation()    // 出站 HTTP 指标
               .AddRuntimeInstrumentation()       // GC/CPU/内存
               .AddConsoleExporter();
        if (!isDevelopment) metrics.AddOtlpExporter();
    })
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation()
               .AddHttpClientInstrumentation()
               .AddEntityFrameworkCoreInstrumentation()
               .AddNpgsql()
               .AddSource("MES.Scheduling")
               .AddConsoleExporter();
        if (!isDevelopment) tracing.AddOtlpExporter();
    });
var app = builder.Build();

// 开发环境配置
var enableSwagger = app.Environment.IsDevelopment()
    || aimesHostOptions.EnableSwagger;
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// 中间件链路
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionMiddleware>();

// ForwardedHeaders 必须放在 RateLimiter / Auth 之前，让 Connection.RemoteIpAddress 反映真实客户端 IP
// （仅当 Aimes:TrustForwardedHeaders=true 时才注册并启用）
if (trustForwarded)
{
    app.UseForwardedHeaders();
}

// HTTPS 重定向：开源/演示环境可通过 Aimes:DisableHttpsRedirect 关闭，
// 否则 docker compose 的 http://localhost:5003 会 307 跳到 https 翻车
var disableHttpsRedirect = aimesHostOptions.DisableHttpsRedirect;
if (!app.Environment.IsDevelopment() && !disableHttpsRedirect)
{
    app.UseHttpsRedirection();
}
app.UseCors(isDevelopment ? "AllowAll" : "Production");
app.UseMiddleware<AuthRateLimitUsernameMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<PasswordChangeRequiredMiddleware>();
app.UseAuthorization();
app.UseMiddleware<TraceValidationMiddleware>();
// 提供静态文件（仪表盘原型等）
app.UseDefaultFiles();
app.UseStaticFiles();

// SPA fallback — 前端路由交给 index.html
app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments("/scheduling"), spApp =>
{
    spApp.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = ["index.html"] });
    spApp.UseStaticFiles();
    spApp.Run(async ctx =>
    {
        var filePath = Path.Combine(ctx.Request.Path.Value ?? "", "index.html");
        var fullPath = Path.Combine(app.Environment.WebRootPath, "scheduling", "index.html");
        if (File.Exists(fullPath))
        {
            ctx.Response.ContentType = "text/html";
            await ctx.Response.SendFileAsync(fullPath);
        }
        else
        {
            ctx.Response.StatusCode = 404;
            await ctx.Response.WriteAsync("前端尚未构建，请执行 cd frontend && npm run build");
        }
    });
});

// 根路径跳转到排程看板，避免评估人猜路径
app.MapGet("/", () => Results.Redirect("/scheduling/"));

// 极简 API 端点
app.MapGroup("/api/v1/auth")
   .MapAuthEndpoints();

app.MapGroup("/api/v1/admin")
   .RequireAuthorization("Admin")
   .MapAdminEndpoints();

app.MapGroup("/api/v1/equipment")
   .RequireAuthorization()
   .MapEquipmentEndpoints();

app.MapGroup("/api/v1/scheduling")
   .RequireAuthorization()
   .MapSchedulingEndpoints();

app.MapGroup("/api/v1/quality")
   .RequireAuthorization()
   .MapQualityEndpoints();

app.MapGroup("/api/v1/anomaly")
   .RequireAuthorization()
   .MapAnomalyEndpoints();

app.MapGroup("/api/v1/production")
   .RequireAuthorization()
   .MapProductionEndpoints();

app.MapGroup("/api/v1/audit-logs")
   .RequireAuthorization("Admin")
   .MapAuditLogEndpoints();

app.MapGroup("/api/v1/bom")
   .RequireAuthorization()
   .MapBomEndpoints();

app.MapGroup("/api/v1/employee")
   .RequireAuthorization()
   .MapEmployeeEndpoints();

app.MapGroup("/api/v1/inventory")
   .RequireAuthorization()
   .MapInventoryEndpoints();

app.MapGroup("/api/v1/knowledge")
   .RequireAuthorization()
   .MapKnowledgeEndpoints();

#if !AIMES_OPEN_SOURCE
// /llm 端点暴露 LLM Provider 配置查询，仅商业版构建包含
app.MapGroup("/api/v1/llm")
   .RequireAuthorization()
   .MapLlmEndpoints();
#endif

app.MapGroup("/api/v1/purchase")
   .RequireAuthorization()
   .MapPurchaseEndpoints();

app.MapGroup("/api/v1/dashboard")
   .RequireAuthorization()
   .MapDashboardEndpoints();

app.MapGroup("/api/v1/scan")
   .RequireAuthorization()
   .MapScanEndpoints();

app.MapGroup("/api/v1/report")
   .RequireAuthorization()
   .MapReportEndpoints();

app.MapGroup("/api/v1/risk")
   .RequireAuthorization()
   .MapRiskEndpoints();

app.MapGroup("/api/v1/routing")
   .RequireAuthorization()
   .MapRoutingEndpoints();

// SignalR 实时通知
app.MapHub<MES.Api.Hubs.NotificationHub>("/hubs/notifications");
app.MapHub<MES.Api.Hubs.MonitoringHub>("/hubs/monitoring");

// 健康检查端点：live 不检查外部依赖；startup 校验启动门；ready 检查生产依赖。
app.MapHealthChecks("/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
}).AllowAnonymous();
app.MapHealthChecks("/startup", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("startup")
}).AllowAnonymous();
app.MapHealthChecks("/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
}).AllowAnonymous();
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true
}).AllowAnonymous();
app.MapHealthChecks("/healthz/secured", new HealthCheckOptions
{
    Predicate = _ => true
}).RequireAuthorization();

// 生产环境只校验 schema，迁移由部署流程显式执行。
try
{
    using var scope = app.Services.CreateScope();
    var databaseStartupValidator = scope.ServiceProvider.GetRequiredService<IDatabaseStartupValidator>();
    await databaseStartupValidator.ValidateAsync(app.Lifetime.ApplicationStopping);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    if (DatabaseStartupFailureHandler.Handle(ex, app.Environment, logger))
    {
        throw;
    }
}

// 启动后打印评估人友好横幅 — 让 docker compose up 后第一眼就知道下一步
app.Lifetime.ApplicationStarted.Register(() =>
{
    var addresses = app.Urls.Count > 0
        ? string.Join(", ", app.Urls)
        : "http://localhost:5003";
    var primary = app.Urls.FirstOrDefault() ?? "http://localhost:5003";
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation(
        "AIMes V1 started. Addresses={Addresses}; Dashboard={DashboardUrl}; Swagger={SwaggerUrl}; Health={HealthUrl}; DemoCredentials={DemoCredentials}; CommercialInfo={CommercialInfo}",
        addresses,
        $"{primary}/scheduling/",
        $"{primary}/swagger",
        $"{primary}/health",
        "development-only; see demo runbook",
        "_docs/commercial-vs-opensource.md");
});

app.Run();

public sealed class StartupHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(HealthCheckResult.Healthy("Application startup completed."));
    }
}

public sealed class QdrantHealthCheck(
    IOptions<QdrantHealthOptions> options,
    IHttpClientFactory httpClientFactory) : IHealthCheck
{
    private readonly QdrantHealthOptions _options = options.Value;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (!_options.IsQdrantEnabled)
        {
            return HealthCheckResult.Healthy("Qdrant disabled by vector store provider.");
        }

        var host = _options.Host;
        var port = _options.Port;
        if (string.IsNullOrWhiteSpace(host))
        {
            return HealthCheckResult.Unhealthy("Qdrant host is required when Qdrant provider is enabled.");
        }

        var client = httpClientFactory.CreateClient("qdrant-health");
        using var request = new HttpRequestMessage(HttpMethod.Get, $"http://{host}:{port}/healthz");
        var apiKey = _options.ApiKey;
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            request.Headers.Add("api-key", apiKey);
        }

        var response = await client.SendAsync(request, cancellationToken);
        return response.IsSuccessStatusCode
            ? HealthCheckResult.Healthy("Qdrant health endpoint is reachable.")
            : HealthCheckResult.Unhealthy($"Qdrant health endpoint returned {(int)response.StatusCode}.");
    }
}
