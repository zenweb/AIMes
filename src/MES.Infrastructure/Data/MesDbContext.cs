using MES.Domain.Entities;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Routing;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
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
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ignore dictionary-valued navigation properties that EF can't map
        modelBuilder.Entity<Equipment>().Ignore(e => e.Parameters);
        modelBuilder.Entity<EquipmentTelemetry>().Ignore(e => e.Parameters);
        modelBuilder.Entity<QualityInspection>().Ignore(e => e.MeasurementData);
        modelBuilder.Entity<WorkOrder>().Ignore(e => e.CustomFields);

        // configure DefectRecord as an owned entity without a key
        modelBuilder.Entity<QualityInspection>().OwnsMany(e => e.Defects, d =>
        {
            d.WithOwner();
            d.ToTable("defect_records");
        });

        // 工单配置
        modelBuilder.Entity<WorkOrder>(entity =>
        {
            entity.ToTable("work_orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OrderNumber).HasColumnName("order_number").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProductCode).HasColumnName("product_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProductName).HasColumnName("product_name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.PlannedQuantity).HasColumnName("planned_quantity");
            entity.Property(e => e.CompletedQuantity).HasColumnName("completed_quantity");
            entity.Property(e => e.PlannedStartDate).HasColumnName("planned_start_date");
            entity.Property(e => e.PlannedEndDate).HasColumnName("planned_end_date");
            entity.Property(e => e.ActualStartDate).HasColumnName("actual_start_date");
            entity.Property(e => e.ActualEndDate).HasColumnName("actual_end_date");
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.WorkshopId).HasColumnName("workshop_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.RouteCode).HasColumnName("route_code").HasMaxLength(50);
            entity.Property(e => e.Priority).HasColumnName("priority");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            // 索引
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.WorkshopId);
            entity.HasIndex(e => e.PlannedStartDate);
        });

        modelBuilder.Entity<OperationExecution>(entity =>
        {
            entity.ToTable("operation_executions");
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.DomainEvents);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.OperationCode).HasColumnName("operation_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.OperationName).HasColumnName("operation_name").HasMaxLength(200);
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.OperatorId).HasColumnName("operator_id").HasMaxLength(50);
            entity.Property(e => e.StationId).HasColumnName("station_id").HasMaxLength(50);
            entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").HasMaxLength(50);
            entity.Property(e => e.SuspendReason).HasColumnName("suspend_reason").HasMaxLength(500);
            entity.Property(e => e.ExceptionReason).HasColumnName("exception_reason").HasMaxLength(500);
            entity.Property(e => e.CompletedQuantity).HasColumnName("completed_quantity");
            entity.Property(e => e.StartedAt).HasColumnName("started_at");
            entity.Property(e => e.PausedAt).HasColumnName("paused_at");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.FailedAt).HasColumnName("failed_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.WorkOrderId);
            entity.HasIndex(e => e.OperationCode);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<OperationReport>(entity =>
        {
            entity.ToTable("operation_reports");
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.DomainEvents);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.OperationId).HasColumnName("operation_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ReportedQuantity).HasColumnName("reported_quantity");
            entity.Property(e => e.DefectQuantity).HasColumnName("defect_quantity");
            entity.Property(e => e.InspectionResult).HasColumnName("inspection_result").HasConversion<string>();
            entity.Property(e => e.ReportedBy).HasColumnName("reported_by").HasMaxLength(50);
            entity.Property(e => e.ReportedAt).HasColumnName("reported_at");
            entity.OwnsOne(e => e.ParameterSnapshot, snapshot =>
            {
                snapshot.Property(s => s.CapturedAt).HasColumnName("parameter_captured_at");
                snapshot.Property(s => s.Parameters)
                    .HasColumnName("parameters")
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                        v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new()
                    );
            });
            entity.OwnsMany(e => e.MaterialConsumed, material =>
            {
                material.ToTable("operation_report_materials");
                material.WithOwner().HasForeignKey("operation_report_id");
                material.Property<int>("id");
                material.HasKey("id");
                material.Property(m => m.MaterialCode).HasColumnName("material_code").HasMaxLength(50);
                material.Property(m => m.Quantity).HasColumnName("quantity");
                material.Property(m => m.Unit).HasColumnName("unit").HasMaxLength(20);
                material.Property(m => m.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            });
            entity.HasIndex(e => e.WorkOrderId);
            entity.HasIndex(e => e.OperationId);
            entity.HasIndex(e => e.ReportedAt);
        });

        // 设备配置
        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.ToTable("equipment");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EquipmentCode).HasColumnName("equipment_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.EquipmentName).HasColumnName("equipment_name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.EquipmentType).HasColumnName("equipment_type").HasMaxLength(50);
            entity.Property(e => e.WorkshopId).HasColumnName("workshop_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.WorkshopName).HasColumnName("workshop_name").HasMaxLength(200);
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.UtilizationRate).HasColumnName("utilization_rate");
            entity.Property(e => e.LastMaintenanceDate).HasColumnName("last_maintenance_date");
            entity.Property(e => e.NextMaintenanceDate).HasColumnName("next_maintenance_date");
            entity.Property(e => e.CurrentWorkOrderId).HasColumnName("current_work_order_id").HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.EquipmentCode).IsUnique();
            entity.HasIndex(e => e.WorkshopId);
            entity.HasIndex(e => e.Status);
        });

        // 设备遥测数据配置
        modelBuilder.Entity<EquipmentTelemetry>(entity =>
        {
            entity.ToTable("equipment_telemetry");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.ErrorCode).HasColumnName("error_code").HasMaxLength(50);
            entity.Property(e => e.ErrorMessage).HasColumnName("error_message").HasMaxLength(500);

            entity.HasIndex(e => e.EquipmentId);
            entity.HasIndex(e => e.Timestamp);
        });

        // 维护记录配置
        modelBuilder.Entity<MaintenanceRecord>(entity =>
        {
            entity.ToTable("maintenance_records");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.MaintenanceType).HasColumnName("maintenance_type").HasMaxLength(50);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.PerformedBy).HasColumnName("performed_by").HasMaxLength(100);
            entity.Property(e => e.Result).HasColumnName("result").HasMaxLength(500);
            entity.Property(e => e.Cost).HasColumnName("cost");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.EquipmentId);
        });

        // 物料配置
        modelBuilder.Entity<Material>(entity =>
        {
            entity.ToTable("materials");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MaterialCode).HasColumnName("material_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.MaterialName).HasColumnName("material_name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.MaterialType).HasColumnName("material_type").HasMaxLength(50);
            entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
            entity.Property(e => e.AvailableQuantity).HasColumnName("available_quantity");
            entity.Property(e => e.ReservedQuantity).HasColumnName("reserved_quantity");
            entity.Property(e => e.SafetyStock).HasColumnName("safety_stock");
            entity.Property(e => e.StorageLocation).HasColumnName("storage_location").HasMaxLength(100);
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.MaterialCode).IsUnique();
        });

        // 质量检验配置
        modelBuilder.Entity<QualityInspection>(entity =>
        {
            entity.ToTable("quality_inspections");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProductCode).HasColumnName("product_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProcessName).HasColumnName("process_name").HasMaxLength(100);
            entity.Property(e => e.InspectionPoint).HasColumnName("inspection_point").HasMaxLength(100);
            entity.Property(e => e.InspectionQuantity).HasColumnName("inspection_quantity");
            entity.Property(e => e.QualifiedQuantity).HasColumnName("qualified_quantity");
            entity.Property(e => e.DefectQuantity).HasColumnName("defect_quantity");
            entity.Property(e => e.Result).HasColumnName("result").HasConversion<string>();
            entity.Property(e => e.InspectorId).HasColumnName("inspector_id").HasMaxLength(50);
            entity.Property(e => e.InspectedAt).HasColumnName("inspected_at");

            entity.HasIndex(e => e.WorkOrderId);
            entity.HasIndex(e => e.ProductCode);
            entity.HasIndex(e => e.InspectedAt);
        });

        // 排产计划配置
        modelBuilder.Entity<SchedulePlan>(entity =>
        {
            entity.ToTable("schedule_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PlanName).HasColumnName("plan_name").HasMaxLength(200);
            entity.Property(e => e.PlanStartDate).HasColumnName("plan_start_date");
            entity.Property(e => e.PlanEndDate).HasColumnName("plan_end_date");
            entity.Property(e => e.OverallUtilizationRate).HasColumnName("overall_utilization_rate");
            entity.Property(e => e.OnTimeDeliveryRate).HasColumnName("on_time_delivery_rate");
            entity.Property(e => e.OptimizationNotes).HasColumnName("optimization_notes").HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasMany(e => e.Items)
                .WithOne()
                .HasForeignKey("SchedulePlanId")
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 排产明细配置
        modelBuilder.Entity<ScheduleItem>(entity =>
        {
            entity.ToTable("schedule_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.PlannedStartTime).HasColumnName("planned_start_time");
            entity.Property(e => e.PlannedEndTime).HasColumnName("planned_end_time");
            entity.Property(e => e.Sequence).HasColumnName("sequence");
            entity.Property(e => e.SetupTime).HasColumnName("setup_time").HasMaxLength(50);

            entity.HasIndex(e => e.WorkOrderId);
            entity.HasIndex(e => e.EquipmentId);
        });

        // 文档块配置（用于RAG）
        modelBuilder.Entity<DocumentChunk>(entity =>
        {
            entity.ToTable("document_chunks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content").IsRequired();
            entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.Ignore(e => e.Metadata);
            entity.Ignore(e => e.Vector);

            entity.HasIndex(e => e.Source);
        });

        // 聊天消息配置
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.ToTable("chat_messages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SessionId).HasColumnName("session_id").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(20);
            entity.Property(e => e.Content).HasColumnName("content").IsRequired();
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");

            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => e.Timestamp);
        });

        // 审计日志配置
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Action).HasColumnName("action").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Resource).HasColumnName("resource").IsRequired().HasMaxLength(200);
            entity.Property(e => e.ResourceId).HasColumnName("resource_id").HasMaxLength(100);
            entity.Property(e => e.OldValues).HasColumnName("old_values");
            entity.Property(e => e.NewValues).HasColumnName("new_values");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(100);
            entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Resource);
            entity.HasIndex(e => e.ResourceId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // AI 决策追踪配置
        modelBuilder.Entity<AiDecisionTraceEntity>(entity =>
        {
            entity.ToTable("ai_decision_traces");
            entity.HasKey(e => e.TraceId);
            entity.Property(e => e.TraceId).HasColumnName("trace_id");
            entity.Property(e => e.AgentName).HasColumnName("agent_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.AgentVersion).HasColumnName("agent_version").HasMaxLength(50);
            entity.Property(e => e.ModelProvider).HasColumnName("model_provider").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ModelName).HasColumnName("model_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.ModelVersion).HasColumnName("model_version").HasMaxLength(50);
            entity.Property(e => e.PromptHash).HasColumnName("prompt_hash").HasMaxLength(100);
            entity.Property(e => e.ContextHash).HasColumnName("context_hash").HasMaxLength(100);
            entity.Property(e => e.InputSummary).HasColumnName("input_summary");
            entity.Property(e => e.OutputSummary).HasColumnName("output_summary");
            entity.Property(e => e.Confidence).HasColumnName("confidence").HasColumnType("decimal(3,2)");
            entity.Property(e => e.TokensInput).HasColumnName("tokens_input");
            entity.Property(e => e.TokensOutput).HasColumnName("tokens_output");
            entity.Property(e => e.LatencyMs).HasColumnName("latency_ms");
            entity.Property(e => e.HumanAdoptionStatus).HasColumnName("human_adoption_status").HasConversion<string>();
            entity.Property(e => e.SourceReferences).HasColumnName("source_references");
            entity.Property(e => e.RelatedBusinessKeys).HasColumnName("related_business_keys");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.AgentName);
            entity.HasIndex(e => e.CreatedAt);
        });

        modelBuilder.Entity<BillOfMaterial>(entity =>
        {
            entity.ToTable("bills_of_material");
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.DomainEvents);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
            entity.Property(e => e.BomCode).HasColumnName("bom_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.BomName).HasColumnName("bom_name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProductName).HasColumnName("product_name").HasMaxLength(200);
            entity.Property(e => e.BomType).HasColumnName("bom_type").HasConversion<string>();
            entity.Property(e => e.BomVersionStatus).HasColumnName("bom_version_status").HasConversion<string>();
            entity.Property(e => e.EffectiveDate).HasColumnName("effective_date");
            entity.Property(e => e.ExpireDate).HasColumnName("expire_date");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.OwnsOne(e => e.ProductCode, p =>
            {
                p.Property(x => x.Value).HasColumnName("product_code").IsRequired().HasMaxLength(50);
            });

            entity.OwnsMany(e => e.Items, item =>
            {
                item.ToTable("bom_items");
                item.WithOwner().HasForeignKey("bom_id");
                item.HasKey(e => e.Id);
                item.Property(e => e.Id).HasColumnName("id");
                item.OwnsOne(e => e.MaterialCode, m => m.Property(x => x.Value).HasColumnName("material_code").IsRequired().HasMaxLength(50));
                item.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
                item.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
                item.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                item.Property(e => e.LossRate).HasColumnName("loss_rate").HasColumnType("decimal(8,4)");
                item.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
                item.Property(e => e.ConsumptionTiming).HasColumnName("consumption_timing").HasMaxLength(100);
                item.Property(e => e.Sequence).HasColumnName("sequence");
                item.OwnsMany(e => e.Children, child =>
                {
                    child.ToTable("bom_item_children");
                    child.WithOwner().HasForeignKey("parent_item_id");
                    child.HasKey(e => e.Id);
                    child.Property(e => e.Id).HasColumnName("id");
                    child.OwnsOne(e => e.MaterialCode, m => m.Property(x => x.Value).HasColumnName("material_code").IsRequired().HasMaxLength(50));
                    child.Property(e => e.MaterialName).HasColumnName("material_name").HasMaxLength(200);
                    child.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("decimal(18,4)");
                    child.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                    child.Property(e => e.LossRate).HasColumnName("loss_rate").HasColumnType("decimal(8,4)");
                    child.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
                    child.Property(e => e.ConsumptionTiming).HasColumnName("consumption_timing").HasMaxLength(100);
                    child.Property(e => e.Sequence).HasColumnName("sequence");
                });
            });

            entity.OwnsMany(e => e.ChangeHistory, change =>
            {
                change.ToTable("bom_change_records");
                change.WithOwner().HasForeignKey("bom_id");
                change.HasKey(e => e.Id);
                change.Property(e => e.Id).HasColumnName("id");
                change.Property(e => e.ChangeDescription).HasColumnName("change_description").HasMaxLength(1000);
                change.Property(e => e.ChangedBy).HasColumnName("changed_by").HasMaxLength(100);
                change.Property(e => e.ChangedAt).HasColumnName("changed_at");
            });

            entity.HasIndex(e => e.BomCode).IsUnique();
        });

        modelBuilder.Entity<ProcessRoute>(entity =>
        {
            entity.ToTable("process_routes");
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.DomainEvents);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
            entity.Property(e => e.RouteCode).HasColumnName("route_code").IsRequired().HasMaxLength(50);
            entity.Property(e => e.RouteName).HasColumnName("route_name").IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProductName).HasColumnName("product_name").HasMaxLength(200);
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.TotalLeadTimeMinutes).HasColumnName("total_lead_time_minutes");
            entity.OwnsOne(e => e.ProductCode, p => p.Property(x => x.Value).HasColumnName("product_code").IsRequired().HasMaxLength(50));

            entity.OwnsMany(e => e.Steps, step =>
            {
                step.ToTable("routing_steps");
                step.WithOwner().HasForeignKey("route_id");
                step.HasKey(e => e.Id);
                step.Property(e => e.Id).HasColumnName("id");
                step.Property(e => e.StepSequence).HasColumnName("step_sequence");
                step.OwnsOne(e => e.OperationCode, o => o.Property(x => x.Value).HasColumnName("operation_code").IsRequired().HasMaxLength(50));
                step.Property(e => e.OperationName).HasColumnName("operation_name").HasMaxLength(200);
                step.Property(e => e.WorkstationType).HasColumnName("workstation_type").HasMaxLength(100);
                step.Property(e => e.StandardSetupMinutes).HasColumnName("standard_setup_minutes");
                step.Property(e => e.StandardRunMinutesPerUnit).HasColumnName("standard_run_minutes_per_unit");
                step.Property(e => e.EquipmentType).HasColumnName("equipment_type").HasMaxLength(100);
                step.Property(e => e.InspectionRequired).HasColumnName("inspection_required");
                step.OwnsMany(e => e.Parameters, parameter =>
                {
                    parameter.ToTable("routing_step_parameters");
                    parameter.WithOwner().HasForeignKey("routing_step_id");
                    parameter.Property<string>("Id").HasColumnName("id");
                    parameter.HasKey("Id");
                    parameter.Property(e => e.ParameterCode).HasColumnName("parameter_code").HasMaxLength(50);
                    parameter.Property(e => e.ParameterName).HasColumnName("parameter_name").HasMaxLength(100);
                    parameter.Property(e => e.DefaultValue).HasColumnName("default_value").HasMaxLength(200);
                    parameter.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                    parameter.Property(e => e.UpperLimit).HasColumnName("upper_limit");
                    parameter.Property(e => e.LowerLimit).HasColumnName("lower_limit");
                    parameter.Property(e => e.IsMandatory).HasColumnName("is_mandatory");
                });
            });

            entity.HasIndex(e => e.RouteCode).IsUnique();
        });

        modelBuilder.Entity<ProductionAnomaly>(entity =>
        {
            entity.ToTable("production_anomalies");
            entity.HasKey(e => e.Id);
            entity.Ignore(e => e.DomainEvents);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Version).HasColumnName("version").IsConcurrencyToken();
            entity.OwnsOne(e => e.WorkOrderNumber, w => w.Property(x => x.Value).HasColumnName("work_order_number").IsRequired().HasMaxLength(50));
            entity.OwnsOne(e => e.OperationCode, o => o.Property(x => x.Value).HasColumnName("operation_code").IsRequired().HasMaxLength(50));
            entity.Property(e => e.EquipmentId).HasColumnName("equipment_id").HasMaxLength(50);
            entity.Property(e => e.AnomalyType).HasColumnName("anomaly_type").HasMaxLength(100);
            entity.Property(e => e.Severity).HasColumnName("severity").HasConversion<string>();
            entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
            entity.Property(e => e.DetectedAt).HasColumnName("detected_at");
            entity.Property(e => e.DetectedBy).HasColumnName("detected_by").HasMaxLength(100);
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
            entity.Property(e => e.RootCause).HasColumnName("root_cause").HasMaxLength(1000);
            entity.Property(e => e.Resolution).HasColumnName("resolution").HasMaxLength(1000);
            entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
            entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by").HasMaxLength(100);
            entity.OwnsMany(e => e.Responses, response =>
            {
                response.ToTable("anomaly_responses");
                response.WithOwner().HasForeignKey("anomaly_id");
                response.HasKey(e => e.Id);
                response.Property(e => e.Id).HasColumnName("id");
                response.Property(e => e.ResponseType).HasColumnName("response_type").HasConversion<string>();
                response.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                response.Property(e => e.SuggestedAction).HasColumnName("suggested_action").HasMaxLength(1000);
                response.Property(e => e.SuggestedBy).HasColumnName("suggested_by").HasMaxLength(100);
                response.Property(e => e.Status).HasColumnName("status").HasConversion<string>();
                response.Property(e => e.ExecutedAt).HasColumnName("executed_at");
                response.Property(e => e.ExecutedBy).HasColumnName("executed_by").HasMaxLength(100);
                response.Property(e => e.CreatedAt).HasColumnName("created_at");
                response.OwnsOne(e => e.AiDecisionTrace, trace =>
                {
                    trace.Property(e => e.TraceId).HasColumnName("ai_trace_id").HasMaxLength(100);
                    trace.Property(e => e.AgentName).HasColumnName("ai_agent_name").HasMaxLength(100);
                    trace.Property(e => e.AgentVersion).HasColumnName("ai_agent_version").HasMaxLength(50);
                    trace.Property(e => e.ModelProvider).HasColumnName("ai_model_provider").HasMaxLength(50);
                    trace.Property(e => e.ModelName).HasColumnName("ai_model_name").HasMaxLength(100);
                    trace.Property(e => e.ModelVersion).HasColumnName("ai_model_version").HasMaxLength(50);
                    trace.Property(e => e.PromptHash).HasColumnName("ai_prompt_hash").HasMaxLength(100);
                    trace.Property(e => e.ContextHash).HasColumnName("ai_context_hash").HasMaxLength(100);
                    trace.Property(e => e.InputSummary).HasColumnName("ai_input_summary");
                    trace.Property(e => e.OutputSummary).HasColumnName("ai_output_summary");
                    trace.Property(e => e.Confidence).HasColumnName("ai_confidence").HasColumnType("decimal(3,2)");
                    trace.Property(e => e.TokensInput).HasColumnName("ai_tokens_input");
                    trace.Property(e => e.TokensOutput).HasColumnName("ai_tokens_output");
                    trace.Property(e => e.LatencyMs).HasColumnName("ai_latency_ms");
                    trace.Property(e => e.HumanAdoptionStatus).HasColumnName("ai_human_adoption_status").HasConversion<string>();
                    trace.Property(e => e.SourceReferences).HasColumnName("ai_source_references");
                    trace.Property(e => e.RelatedBusinessKeys).HasColumnName("ai_related_business_keys");
                    trace.Property(e => e.CreatedAt).HasColumnName("ai_created_at");
                });
            });
        });


        // 种子数据
        SeedData(modelBuilder);
    }

    /// <summary>
    /// 种子数据
    /// </summary>
    private static void SeedData(ModelBuilder modelBuilder)
    {
        // 种子设备
        modelBuilder.Entity<Equipment>().HasData(
            new Equipment
            {
                Id = "eq-001",
                EquipmentCode = "CNC-001",
                EquipmentName = "CNC加工中心1号",
                EquipmentType = "CNC",
                WorkshopId = "ws-001",
                WorkshopName = "精密加工车间",
                Status = EquipmentStatus.Available,
                Capacity = 100,
                UtilizationRate = 0,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Equipment
            {
                Id = "eq-002",
                EquipmentCode = "CNC-002",
                EquipmentName = "CNC加工中心2号",
                EquipmentType = "CNC",
                WorkshopId = "ws-001",
                WorkshopName = "精密加工车间",
                Status = EquipmentStatus.Available,
                Capacity = 100,
                UtilizationRate = 0,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // 种子物料
        modelBuilder.Entity<Material>().HasData(
            new Material
            {
                Id = "mat-001",
                MaterialCode = "AL-6061",
                MaterialName = "铝合金6061",
                MaterialType = "原材料",
                Unit = "KG",
                AvailableQuantity = 1000,
                ReservedQuantity = 0,
                SafetyStock = 100,
                StorageLocation = "A-01-01",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
