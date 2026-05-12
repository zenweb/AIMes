using MES.Api.Extensions;
using MES.Api.Filters;
using MES.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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

// 添加跨域服务
builder.Services.AddCorsServices(builder.Configuration);

// Swagger 按 API 版本分组
builder.Services.AddSwaggerServices();

// 健康检查（含各组件探针）
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "postgresql", tags: new[] { "db", "sql" })
    .AddRedis(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379", name: "redis", tags: new[] { "cache" });
// OpenTelemetry 基础链路（具体 instrumentation 在 Phase 1A 补充）
builder.Services.AddOpenTelemetry();
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

// 健康检查端点
app.MapHealthChecks("/health");
app.MapHealthChecks("/healthz/secured", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true
}).RequireAuthorization();

// 确保数据库创建（仅 dev 模式）
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MES.Infrastructure.Data.MesDbContext>();
    dbContext.Database.EnsureCreated();
}

app.Run();
