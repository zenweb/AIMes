using System.Text;
using System.Text.Json.Serialization;
using MES.Api.Endpoints;
using MES.Api.Extensions;
using MES.Api.Middleware;
using MES.Api.Services;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;

// 全局结构化日志
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {TraceId} {UserId} {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Serilog 接管 ASP.NET 日志
builder.Host.UseSerilog();

var isDevelopment = builder.Environment.IsDevelopment();
var jwtSection = builder.Configuration.GetSection("Jwt");
// JWT 签名密钥：必须由环境变量或 user-secrets 提供（避免任何 demo key 进入 Production 流程）。
// 开发环境如未配置则生成临时随机 key 并打印警告；生产环境直接抛错。
var configuredSigningKey = jwtSection["SigningKey"];
string signingKey;
if (!string.IsNullOrWhiteSpace(configuredSigningKey))
{
    signingKey = configuredSigningKey;
}
else if (isDevelopment)
{
    var randomBytes = new byte[32];
    System.Security.Cryptography.RandomNumberGenerator.Fill(randomBytes);
    signingKey = Convert.ToBase64String(randomBytes);
    Log.Warning("Jwt:SigningKey 未配置，已生成临时开发密钥（重启失效）。生产部署必须通过 Jwt__SigningKey 环境变量提供。");
}
else
{
    throw new InvalidOperationException("Jwt:SigningKey is required in production. Set the Jwt__SigningKey environment variable.");
}

// 密钥轮转 + Token 黑名单
var keyStore = new SigningKeyStore(signingKey);
builder.Services.AddSingleton(keyStore);
builder.Services.AddSingleton<TokenBlacklistService>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 速率限制 — 登录接口按 IP 分区，避免全局共享配额
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("Auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
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
    .AddJwtBearer(options =>
    {
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
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
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
var trustForwarded = builder.Configuration.GetValue<bool>("Aimes:TrustForwardedHeaders");
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
builder.Services.AddHostedService<MES.Api.Services.MetricsBackgroundService>();

// 添加跨域服务
builder.Services.AddCorsServices(builder.Configuration);

// Swagger 按 API 版本分组
builder.Services.AddSwaggerServices();

// 健康检查（含各组件探针，开发环境使用基础检查）
if (!isDevelopment)
{
    var healthDbConn = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(healthDbConn))
    {
        throw new InvalidOperationException(
            "Production health checks require ConnectionStrings:DefaultConnection. " +
            "Set ConnectionStrings__DefaultConnection environment variable.");
    }
    var healthDbProvider = DatabaseProvider.Resolve(builder.Configuration["Database:Provider"]);
    builder.Services.AddHealthChecks()
        .AddRedis(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379", name: "redis", tags: new[] { "cache" });
    if (DatabaseProvider.IsPostgreSql(healthDbProvider))
    {
        builder.Services.AddHealthChecks()
            .AddNpgSql(healthDbConn, name: "postgresql", tags: new[] { "db", "sql" });
    }
}
else
{
    builder.Services.AddHealthChecks();
}
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
               .AddSource("MES.Scheduling")
               .AddConsoleExporter();
        if (!isDevelopment) tracing.AddOtlpExporter();
    });
var app = builder.Build();

// 开发环境配置
var enableSwagger = app.Environment.IsDevelopment()
    || builder.Configuration.GetValue<bool>("Aimes:EnableSwagger");
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
app.UseMiddleware<RequestLoggingMiddleware>();

// ForwardedHeaders 必须放在 RateLimiter / Auth 之前，让 Connection.RemoteIpAddress 反映真实客户端 IP
// （仅当 Aimes:TrustForwardedHeaders=true 时才注册并启用）
if (trustForwarded)
{
    app.UseForwardedHeaders();
}

// HTTPS 重定向：开源/演示环境可通过 Aimes:DisableHttpsRedirect 关闭，
// 否则 docker compose 的 http://localhost:5000 会 307 跳到 https 翻车
var disableHttpsRedirect = builder.Configuration.GetValue<bool>("Aimes:DisableHttpsRedirect");
if (!app.Environment.IsDevelopment() && !disableHttpsRedirect)
{
    app.UseHttpsRedirection();
}
app.UseCors(isDevelopment ? "AllowAll" : "Production");
app.UseRateLimiter();
app.UseAuthentication();
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

// 健康检查端点
app.MapHealthChecks("/health");
app.MapHealthChecks("/healthz/secured", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true
}).RequireAuthorization();

// 自动执行数据库迁移
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MES.Infrastructure.Data.MesDbContext>();
    var databaseProvider = DatabaseProvider.Resolve(builder.Configuration["Database:Provider"]);
    if (DatabaseProvider.IsSqlServer(databaseProvider) && app.Environment.IsDevelopment())
    {
        await dbContext.Database.EnsureCreatedAsync();
        await DemoDataSeeder.SeedAsync(dbContext);
    }
    else
    {
        await dbContext.Database.MigrateAsync();
        if (app.Environment.IsDevelopment())
        {
            await DemoDataSeeder.SeedAsync(dbContext);
        }
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    if (app.Environment.IsDevelopment())
    {
        logger.LogWarning(ex, "数据库不可用，API 将以无持久化模式运行");
    }
    else
    {
        logger.LogCritical(ex, "数据库不可用，无法启动");
        throw;
    }
}

// 启动后打印评估人友好横幅 — 让 docker compose up 后第一眼就知道下一步
app.Lifetime.ApplicationStarted.Register(() =>
{
    var addresses = app.Urls.Count > 0
        ? string.Join(", ", app.Urls)
        : "http://localhost:5000";
    var primary = app.Urls.FirstOrDefault() ?? "http://localhost:5000";
    Console.WriteLine();
    Console.WriteLine("╔══════════════════════════════════════════════════════════╗");
    Console.WriteLine("║  AIMes V1 — 智能 MES 系统（开源版）                       ║");
    Console.WriteLine("╠══════════════════════════════════════════════════════════╣");
    Console.WriteLine($"║  ✓ 后端就绪：  {primary,-42}║");
    Console.WriteLine($"║  ✓ 看板入口：  {primary + "/scheduling/",-42}║");
    Console.WriteLine($"║  ✓ API 文档：  {primary + "/swagger",-42}║");
    Console.WriteLine($"║  ✓ 健康检查：  {primary + "/health",-42}║");
    Console.WriteLine("║                                                          ║");
    Console.WriteLine("║  默认账号：    admin / admin123                           ║");
    Console.WriteLine("║  ⚠️  仅演示用。生产环境请立即修改密码 + 配置 Jwt:SigningKey ║");
    Console.WriteLine("║                                                          ║");
    Console.WriteLine("║  💡 商业版（LLM 多目标 Pareto / 自学习 / 私有部署）       ║");
    Console.WriteLine("║      详见 _docs/commercial-vs-opensource.md              ║");
    Console.WriteLine("╚══════════════════════════════════════════════════════════╝");
    Console.WriteLine();
});

app.Run();
