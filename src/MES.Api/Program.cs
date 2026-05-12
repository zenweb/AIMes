using MES.Api.Extensions;
using MES.Api.Filters;
using MES.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;
using System.Text;
using System.Text.Json.Serialization;

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
var signingKey = jwtSection["SigningKey"] ?? "AIMes-Development-Signing-Key-For-Local-Only-Change-Me";

// 速率限制
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("Auth", config =>
    {
        config.PermitLimit = 10;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueLimit = 0;
    });
});

// 添加控制器
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ValidateIssuer = !isDevelopment,
            ValidateAudience = !isDevelopment,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Operator", policy => policy.RequireRole("Operator", "Lead", "Engineer", "Admin"));
    options.AddPolicy("Lead", policy => policy.RequireRole("Lead", "Engineer", "Admin"));
    options.AddPolicy("Engineer", policy => policy.RequireRole("Engineer", "Admin"));
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
});

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

// 添加跨域服务
builder.Services.AddCorsServices(builder.Configuration);

// Swagger 按 API 版本分组
builder.Services.AddSwaggerServices();

// 健康检查（含各组件探针，开发环境跳过不可用服务）
if (!isDevelopment)
{
    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "postgresql", tags: new[] { "db", "sql" })
        .AddRedis(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379", name: "redis", tags: new[] { "cache" });
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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

app.UseHttpsRedirection();
app.UseCors("AllowAll");
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

app.MapControllers();

// SignalR 实时通知
app.MapHub<MES.Api.Hubs.NotificationHub>("/hubs/notifications");

// 健康检查端点
app.MapHealthChecks("/health");
app.MapHealthChecks("/healthz/secured", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true
}).RequireAuthorization();

// 确保数据库创建（仅 dev 模式，无 PG 时静默跳过）
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MES.Infrastructure.Data.MesDbContext>();
        dbContext.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "数据库不可用，API 将以无持久化模式运行");
    }
}

app.Run();
