using FluentValidation;
using MassTransit;
using MES.AI.Adapters;
using MES.AI.Core.Scheduling;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Configuration;
using MES.AI.Pro.Services;
using MES.Application.Services;
using MES.Domain.Interfaces.Integration;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using MES.Infrastructure.Events;
using MES.Infrastructure.Persistence;
using MES.Infrastructure.Repositories;
using MES.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MES.Api.Extensions;

/// <summary>
/// 服务集合扩展
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// 添加数据库服务
    /// </summary>
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is required. Set it via environment variable " +
                "ConnectionStrings__DefaultConnection or appsettings.{Environment}.json. " +
                "See docker-compose.yml for the open-source demo example.");
        }

        services.AddDbContext<MesDbContext>(options =>
            options.UseNpgsql(connectionString));
        // 注意：不启用 EnableRetryOnFailure。
        // 原因：EF Core 的 NpgsqlRetryingExecutionStrategy 与用户手动 BeginTransaction（IUnitOfWork.BeginAsync）
        //   不兼容，会抛 InvalidOperationException。要重试需把整个事务块包进 ExecuteAsync 里。
        // 替代方案：在反向代理 / K8s ingress 层做请求级重试（更适合分布式部署）。

        return services;
    }

    /// <summary>
    /// 添加仓储服务
    /// </summary>
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped<IWorkOrderRepository, WorkOrderRepository>();
        services.AddScoped<IEquipmentRepository, EquipmentRepository>();
        services.AddScoped<IMaterialRepository, MaterialRepository>();
        services.AddScoped<IQualityInspectionRepository, QualityInspectionRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IOperationRepository, OperationRepository>();
        services.AddScoped<IBomRepository, BomRepository>();
        services.AddScoped<IRoutingRepository, RoutingRepository>();
        services.AddScoped<IAnomalyRepository, AnomalyRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();
        services.AddScoped<INotificationConfigRepository, NotificationConfigRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IStockTransactionRepository, StockTransactionRepository>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        services.AddScoped<ISchedulingContextProvider, SchedulingContextProvider>();
        services.AddScoped<IBomExplosionService, BomExplosionService>();
        services.AddScoped<IMaterialKittingChecker, MaterialKittingChecker>();
        services.AddScoped<IOperationSequenceExpander, OperationSequenceExpander>();

        return services;
    }

    /// <summary>
    /// 添加应用服务
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ISchedulingAppService, SchedulingAppService>();
        services.AddScoped<IQualityAppService, QualityAppService>();
        services.AddScoped<IEquipmentAppService, EquipmentAppService>();
        services.AddScoped<IKnowledgeAppService, KnowledgeAppService>();
        services.AddScoped<IBomAppService, BomAppService>();
        services.AddScoped<IRoutingAppService, RoutingAppService>();
        services.AddScoped<IAnomalyAppService, AnomalyAppService>();
        services.AddScoped<IInventoryAppService, InventoryAppService>();
        services.AddScoped<IPurchaseAppService, PurchaseAppService>();
        services.AddScoped<IEmployeeAppService, EmployeeAppService>();
        services.AddScoped<IAdminAppService, AdminAppService>();
        services.AddScoped<IAuditLogAppService, AuditLogAppService>();
        services.AddScoped<IRiskAppService, RiskAppService>();
        services.AddScoped<IOperationService, OperationService>();
        services.AddScoped<AdoptionFeedbackService>();
        services.AddScoped<IErpService, ErpServiceStub>();
        services.AddScoped<IWmsService, WmsServiceStub>();
        services.AddScoped<IMaterialCallService, MaterialCallServiceStub>();
        services.AddScoped<IMaterialDeliveryTracker, MaterialDeliveryTrackerStub>();
        services.AddScoped<IDashboardKpiService, DashboardKpiService>();
        services.AddScoped<IExportAppService, ExportAppService>();
        services.AddScoped<IEquipmentCommandService, EquipmentCommandServiceStub>();

        return services;
    }

    /// <summary>
    /// 添加验证服务
    /// </summary>
    public static IServiceCollection AddValidationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Program>();

        return services;
    }

    /// <summary>
    /// 添加AI服务
    /// </summary>
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 配置LLM — 使用 IOptions<T> + 启动时验证
        services.AddOptions<LlmConfig>()
            .Bind(configuration.GetSection("AI:Llm"))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        // 保留 singleton 供现有直接注入 LlmConfig 的代码使用
        var llmConfig = new LlmConfig();
        configuration.GetSection("AI:Llm").Bind(llmConfig);
        services.AddSingleton(llmConfig);
        services.AddHttpClient();
        services.AddSingleton<ILlmGateway, LlmGatewayService>();

        // 注册向量存储服务
        services.AddOptions<VectorStoreConfig>()
            .Bind(configuration.GetSection("AI:VectorStore"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // 根据配置选择 Qdrant 或 InMemory，在Options变更时也需动态判断
        var vectorStoreConfig = new VectorStoreConfig();
        configuration.GetSection("AI:VectorStore").Bind(vectorStoreConfig);
        services.AddSingleton(vectorStoreConfig);
        services.AddSingleton(vectorStoreConfig.Qdrant);

        if (vectorStoreConfig.Provider.Equals("Qdrant", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IVectorStoreService, QdrantVectorStoreService>();
        }
        else
        {
            services.AddSingleton<IVectorStoreService, VectorStoreService>();
        }

        // 注册ONNX推理服务
        services.AddOptions<OnnxConfig>()
            .Bind(configuration.GetSection("AI:Onnx"))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        var onnxConfig = new OnnxConfig();
        configuration.GetSection("AI:Onnx").Bind(onnxConfig);
        services.AddSingleton(onnxConfig);
        services.AddSingleton<IOnnxModelService, OnnxInferenceService>();

        // 注册Semantic Kernel（AI Agents 依赖 Kernel 注入）
        services.AddSingleton<Kernel>(_ => Kernel.CreateBuilder().Build());

        // 注册排产规则引擎
        services.AddSingleton<IConstraintValidator, ConstraintValidator>();
        services.AddSingleton<ISchedulingRuleEngine, SchedulingRuleEngine>();
        services.AddSingleton<LockPeriodManager>();
        services.AddSingleton<IRescheduler, Rescheduler>();
        services.AddScoped<ReschedulingTrigger>();

        // 注册AI Agents
        services.AddTransient<SchedulingAgent>();
        services.AddTransient<QualityAgent>();
        services.AddTransient<AnomalyAgent>();
        services.AddTransient<MaintenanceAgent>();
        services.AddTransient<ProcessParameterAgent>();
        services.AddTransient<KnowledgeAgent>();

        // AI Adapters (跨层解耦)
        services.AddTransient<IAnomalyAnalysisService, AnomalyAnalysisAdapter>();
        services.AddTransient<IQualityAnalysisService, QualityAnalysisAdapter>();
        services.AddTransient<IScheduleOptimizationService, ScheduleOptimizationAdapter>();
        services.AddTransient<AdoptionFeedbackService>();
        services.AddTransient<IAdoptionFeedbackService, AdoptionFeedbackAdapter>();

        // Trace验证器
        services.AddTransient<ITraceValidator, AiDecisionTraceValidator>();

        return services;
    }

    /// <summary>
    /// 添加Swagger服务
    /// </summary>
    public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            // 添加XML注释
            var xmlFiles = Directory.GetFiles(AppContext.BaseDirectory, "*.xml", SearchOption.TopDirectoryOnly);
            foreach (var xmlFile in xmlFiles)
            {
                options.IncludeXmlComments(xmlFile);
            }
        });

        return services;
    }

    /// <summary>
    /// 添加缓存服务
    /// </summary>
    public static IServiceCollection AddCacheServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();

        // 可选：启用Redis分布式缓存
        // services.AddStackExchangeRedisCache(options =>
        // {
        //     options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
        //     options.InstanceName = "AIMes:";
        // });

        return services;
    }

    public static IServiceCollection AddMessagingServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(x =>
        {
            x.AddConsumer<OperationReportedIntegrationEventConsumer>();
            x.AddConsumer<SchedulePlanCreatedIntegrationEventConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                var connectionString = configuration.GetConnectionString("RabbitMQ") ?? "rabbitmq://localhost";
                cfg.Host(new Uri(connectionString));
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }

    /// <summary>
    /// 添加跨域服务
    /// </summary>
    public static IServiceCollection AddCorsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });

            options.AddPolicy("Production", builder =>
            {
                var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();
                if (allowedOrigins != null && allowedOrigins.Length > 0)
                {
                    builder.WithOrigins(allowedOrigins)
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                }
            });
        });

        return services;
    }
}
