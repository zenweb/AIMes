using MES.Domain.Entities;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Employee;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Purchase;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Routing;
using MES.Domain.Entities.Scheduling;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Data;

/// <summary>
/// MES数据库上下文 - PostgreSQL
/// </summary>
public class MesDbContext : DbContext
{
    public MesDbContext(DbContextOptions<MesDbContext> options) : base(options)
    {
    }

    // 工单
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<OperationExecution> OperationExecutions => Set<OperationExecution>();
    public DbSet<OperationReport> OperationReports => Set<OperationReport>();

    // 设备
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<EquipmentTelemetry> EquipmentTelemetry => Set<EquipmentTelemetry>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();

    // 物料
    public DbSet<Material> Materials => Set<Material>();

    // BOM
    public DbSet<BillOfMaterial> BillsOfMaterial => Set<BillOfMaterial>();

    // 工艺路线
    public DbSet<ProcessRoute> ProcessRoutes => Set<ProcessRoute>();

    // 生产异常
    public DbSet<ProductionAnomaly> ProductionAnomalies => Set<ProductionAnomaly>();

    // 质量检验
    public DbSet<QualityInspection> QualityInspections => Set<QualityInspection>();

    // 排产计划
    public DbSet<SchedulePlan> SchedulePlans => Set<SchedulePlan>();
    public DbSet<ScheduleItem> ScheduleItems => Set<ScheduleItem>();

    // 知识库
    public DbSet<DocumentChunk> DocumentChunks => Set<DocumentChunk>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    // 审计日志
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // AI 决策追踪
    public DbSet<AiDecisionTraceEntity> AiDecisionTraces => Set<AiDecisionTraceEntity>();

    // 排产方案采纳反馈
    public DbSet<ScheduleAdoptionFeedback> ScheduleAdoptionFeedbacks => Set<ScheduleAdoptionFeedback>();

    // 库存交易
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    // 采购订单
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();

    // 员工
    public DbSet<Employee> Employees => Set<Employee>();

    // 系统用户
    public DbSet<SystemUser> SystemUsers => Set<SystemUser>();

    // 系统配置
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();

    // 通知配置
    public DbSet<NotificationConfig> NotificationConfigs => Set<NotificationConfig>();

    // 刷新令牌
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MesDbContext).Assembly);

        DataSeeder.Seed(modelBuilder);
    }
}
