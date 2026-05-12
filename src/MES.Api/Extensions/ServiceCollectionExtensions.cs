using FluentValidation;
using MassTransit;
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
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=mes;Username=postgres;Password=postgres";

        services.AddDbContext<MesDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        return services;
    }

    /// <summary>
    /// 添加仓储服务
    /// </summary>
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        services.AddScoped<IWorkOrderRepository, WorkOrderRepository>();
        services.AddScoped<IEquipmentRepository, EquipmentRepository>();
        services.AddScoped<IMaterialRepository, MaterialRepository>();
        services.AddScoped<IQualityInspectionRepository, QualityInspectionRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IOperationRepository, OperationRepository>();
        services.AddScoped<IBomRepository, BomRepository>();
        services.AddScoped<IRoutingRepository, RoutingRepository>();
        services.AddScoped<IAnomalyRepository, AnomalyRepository>();
        services.AddScoped<ISchedulingContextProvider, SchedulingContextProvider>();
        services.AddScoped<BomExplosionService>();
        services.AddScoped<MaterialKittingChecker>();
        services.AddScoped<OperationSequenceExpander>();

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
        services.AddScoped<IOperationService, OperationService>();
        services.AddScoped<AdoptionFeedbackService>();
        services.AddScoped<IErpService, ErpServiceStub>();
        services.AddScoped<IWmsService, WmsServiceStub>();
        services.AddScoped<IMaterialCallService, MaterialCallServiceStub>();
        services.AddScoped<IMaterialDeliveryTracker, MaterialDeliveryTrackerStub>();
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
        // 配置LLM
        var llmConfig = new LlmConfig();
        configuration.GetSection("AI:Llm").Bind(llmConfig);
        services.AddSingleton(llmConfig);

        // 注册LLM网关
        services.AddSingleton<ILlmGateway, LlmGatewayService>();

        // 注册向量存储服务（根据配置选择 Qdrant 或 InMemory）
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
        var onnxConfig = new OnnxConfig();
        configuration.GetSection("AI:Onnx").Bind(onnxConfig);
        services.AddSingleton(onnxConfig);
        services.AddSingleton<IOnnxModelService, OnnxInferenceService>();

        // 注册Semantic Kernel
        services.AddSingleton<Kernel>(sp =>
        {
            var llmGateway = sp.GetRequiredService<ILlmGateway>();
            // Kernel已经在LlmGatewayService中创建
            return Kernel.CreateBuilder().Build();
        });

        // 注册排产规则引擎
        services.AddSingleton<IConstraintValidator, ConstraintValidator>();
        services.AddSingleton<ISchedulingRuleEngine, SchedulingRuleEngine>();
        services.AddSingleton<LockPeriodManager>();
        services.AddSingleton<IRescheduler, Rescheduler>();
        services.AddSingleton<ReschedulingTrigger>();

        // 注册AI Agents
        services.AddTransient<SchedulingAgent>();
        services.AddTransient<QualityAgent>();
        services.AddTransient<AnomalyAgent>();
        services.AddTransient<MaintenanceAgent>();
        services.AddTransient<ProcessParameterAgent>();
        services.AddTransient<KnowledgeAgent>();

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
