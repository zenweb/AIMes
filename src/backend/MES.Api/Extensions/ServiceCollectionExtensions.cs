using FluentValidation;
using MassTransit;
using MES.AI.Core.Scheduling;
using MES.Api.Configuration;
using MES.Api.Services;
#if !AIMES_OPEN_SOURCE
using MES.AI.Adapters;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Configuration;
using MES.AI.Pro.Services;
using Microsoft.SemanticKernel;
#endif
using MES.Application.Services;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using MES.Infrastructure.Events;
using MES.Infrastructure.Persistence;
using MES.Infrastructure.Repositories;
using MES.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using InfrastructureExportAppService = MES.Infrastructure.Services.ExportAppService;

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
        services.AddSingleton(configuration);
        services.AddOptions<DatabaseOptions>()
            .Configure<IConfiguration>(DatabaseOptions.BindFromConfiguration)
            .ValidateDataAnnotations()
            .Validate(DatabaseOptions.HasSupportedProvider, "Database:Provider must be PostgreSQL, SqlServer, or InMemory.")
            .Validate(DatabaseOptions.HasDefaultConnection, "ConnectionStrings:DefaultConnection is required.")
            .ValidateOnStart();

        services.AddDbContext<MesDbContext>((sp, options) =>
        {
            var databaseOptions = sp.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            var provider = databaseOptions.GetResolvedProvider();
            var connectionString = databaseOptions.DefaultConnection;
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", provider);

            if (DatabaseProvider.IsSqlServer(provider))
            {
                options.UseSqlServer(connectionString, sqlServerOptions =>
                {
                    sqlServerOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    sqlServerOptions.UseCompatibilityLevel(130);
                });
                return;
            }

            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        });

        services.AddScoped<IDatabaseSchemaState, EfDatabaseSchemaState>();
        services.AddScoped<IDemoDataSeeder, EfDemoDataSeeder>();
        services.AddScoped<IDatabaseStartupValidator, DatabaseStartupValidator>();

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
        services.AddScoped<IAgentDecisionRepository, AgentDecisionRepository>();
        services.AddSingleton<ISchedulingContextCache, SchedulingContextCache>();
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
        services.AddScoped<IScheduleAgentService, ScheduleAgentService>();
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
        services.AddScoped<IDashboardKpiService, DashboardKpiService>();
        services.AddScoped<IExportAppService, InfrastructureExportAppService>();

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
    /// 添加AI服务。
    /// 默认（商业版）注册全部 Pro Agents/Adapters/向量库/ONNX/SemanticKernel；
    /// 开源构建（AimesOpenSource=true → AIMES_OPEN_SOURCE 编译常量）只注册 Core 部分（Scheduling 规则引擎）。
    /// </summary>
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ============ Core 部分：开源版与商业版共享 ============

        // 注册排产规则引擎
        services.AddSingleton<IConstraintValidator, ConstraintValidator>();
        services.AddSingleton<ISchedulingRuleEngine, SchedulingRuleEngine>();
        services.AddSingleton<LockPeriodManager>();
        services.AddSingleton<IRescheduler, Rescheduler>();
        services.AddScoped<ReschedulingTrigger>();

#if !AIMES_OPEN_SOURCE
        // ============ Pro 部分：仅商业版构建 ============

        // 配置LLM — 使用 IOptions<T> + 启动时验证
        services.AddOptions<LlmConfig>()
            .Bind(configuration.GetSection("AI:Llm"))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<ILlmConcurrencyGate>(sp =>
            new LlmConcurrencyGate(sp.GetRequiredService<IOptions<LlmConfig>>().Value.MaxConcurrency));
        services.AddHttpClient("azure-openai").AddStandardResilienceHandler();
        services.AddHttpClient("openai").AddStandardResilienceHandler();
        services.AddHttpClient("ollama", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(5);
        }).AddStandardResilienceHandler();
        services.AddHttpClient("qdrant-health", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(2);
        }).AddStandardResilienceHandler();
        services.AddSingleton<ILlmGateway, LlmGatewayService>();

        // 注册向量存储服务
        services.AddOptions<VectorStoreConfig>()
            .Bind(configuration.GetSection("AI:VectorStore"))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<IOptions<QdrantConfig>>(sp =>
            Options.Create(sp.GetRequiredService<IOptions<VectorStoreConfig>>().Value.Qdrant));
        services.AddSingleton<QdrantVectorStoreService>();
        services.AddSingleton<VectorStoreService>();
        services.AddSingleton<IVectorStoreService>(sp =>
        {
            var vectorStoreOptions = sp.GetRequiredService<IOptions<VectorStoreConfig>>();
            return vectorStoreOptions.Value.Provider.Equals("Qdrant", StringComparison.OrdinalIgnoreCase)
                ? sp.GetRequiredService<QdrantVectorStoreService>()
                : sp.GetRequiredService<VectorStoreService>();
        });

        // 注册ONNX推理服务
        services.AddOptions<OnnxConfig>()
            .Bind(configuration.GetSection("AI:Onnx"))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<IOnnxModelService, OnnxInferenceService>();

        // 注册Semantic Kernel（AI Agents 依赖 Kernel 注入）
        services.AddSingleton<Kernel>(_ => Kernel.CreateBuilder().Build());

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
        // AdoptionFeedbackService 已在 AddApplicationServices 注册为 Scoped；这里只注册 adapter。
        services.AddTransient<IAdoptionFeedbackService, AdoptionFeedbackAdapter>();

        // Trace验证器
        services.AddTransient<ITraceValidator, AiDecisionTraceValidator>();
#endif

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
    /// 添加缓存服务。
    /// IDistributedCache 用于 TokenBlacklist 的多实例共享：
    /// - 默认 DistributedMemoryCache（单实例 + 重启丢失）
    /// - 配置了 ConnectionStrings:Redis 时自动切到 StackExchange.Redis（多实例 + 持久）
    /// </summary>
    public static IServiceCollection AddCacheServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.AddSingleton(configuration);
        services.AddOptions<CacheOptions>()
            .Configure<IConfiguration>(CacheOptions.BindFromConfiguration)
            .ValidateOnStart();
        var cacheOptions = new CacheOptions();
        CacheOptions.BindFromConfiguration(cacheOptions, configuration);

        if (cacheOptions.HasRedisConnection)
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = cacheOptions.RedisConnection;
                options.InstanceName = cacheOptions.RedisInstanceName;
            });
        }
        else
        {
            // 单实例 fallback：进程内共享 memory，符合 IDistributedCache 接口契约
            services.AddDistributedMemoryCache();
        }

        return services;
    }

    public static IServiceCollection AddMessagingServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(configuration);
        services.AddOptions<MessagingOptions>()
            .Configure<IConfiguration>(MessagingOptions.BindFromConfiguration)
            .ValidateDataAnnotations()
            .Validate(MessagingOptions.HasSupportedTransport, "Messaging:Transport must be Disabled, InMemory, or RabbitMQ.")
            .Validate(MessagingOptions.HasRequiredConnection, "ConnectionStrings:RabbitMQ is required when Messaging:Transport is RabbitMQ.")
            .ValidateOnStart();
        var messagingOptions = new MessagingOptions();
        MessagingOptions.BindFromConfiguration(messagingOptions, configuration);
        if (messagingOptions.IsDisabled)
        {
            return services;
        }

        services.AddMassTransit(x =>
        {
            x.AddConsumer<OperationReportedIntegrationEventConsumer>();
            x.AddConsumer<SchedulePlanCreatedIntegrationEventConsumer>();

            if (messagingOptions.IsInMemory)
            {
                x.UsingInMemory((context, cfg) =>
                {
                    cfg.ConfigureEndpoints(context);
                });
                return;
            }

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(new Uri(messagingOptions.RabbitMqConnection));
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
        services.AddOptions<CorsOptions>(CorsOptions.OptionsName)
            .Bind(configuration)
            .ValidateDataAnnotations()
            .Validate(CorsOptions.HasAllowedOrigins, "AllowedOrigins must contain at least one origin for the Production CORS policy.")
            .ValidateOnStart();
        var productionCorsOptions = new CorsOptions();
        configuration.Bind(productionCorsOptions);
        var allowedOrigins = productionCorsOptions.GetNormalizedAllowedOrigins();

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
                builder.WithOrigins(allowedOrigins)
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials();
            });
        });

        return services;
    }
}
