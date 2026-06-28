using MES.Api.Services;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Agent;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

namespace MES.Tests.Integration;

public class TestDataSeedFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();

            if (!db.Equipment.Any())
            {
                db.Equipment.AddRange(
                    Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "ws-001", "Workshop A", 100),
                    Equipment.Create("CNC-002", "CNC Machine 2", "CNC", "ws-001", "Workshop A", 80));
                db.SaveChanges();
            }

            if (!db.Materials.Any())
            {
                var aluminum = Material.Create(
                    "TEST-AL-001",
                    "测试铝合金",
                    "KG",
                    safetyStock: 50,
                    storageLocation: "A-01",
                    materialType: "原材料",
                    availableQuantity: 500,
                    id: "mat-test-1",
                    createdAt: DateTime.UtcNow);

                var steel = Material.Create(
                    "TEST-STEEL-001",
                    "测试钢材",
                    "KG",
                    safetyStock: 80,
                    storageLocation: "B-02",
                    materialType: "原材料",
                    availableQuantity: 100,
                    id: "mat-test-2",
                    createdAt: DateTime.UtcNow);
                steel.Reserve(30);

                db.Materials.AddRange(
                    aluminum,
                    steel);
                db.SaveChanges();
            }

            if (!db.WorkOrders.Any())
            {
                var now = DateTime.UtcNow;
                db.WorkOrders.AddRange(
                    WorkOrder.Create(
                        "TEST-WO-001",
                        "TEST-PROD-A",
                        "测试排产产品 A",
                        20,
                        now.AddHours(-1),
                        now.AddHours(6),
                        "ws-001",
                        priority: 1,
                        routeCode: "TEST-ROUTE-A"),
                    WorkOrder.Create(
                        "TEST-WO-002",
                        "TEST-PROD-B",
                        "测试排产产品 B",
                        15,
                        now,
                        now.AddHours(8),
                        "ws-001",
                        priority: 2,
                        routeCode: "TEST-ROUTE-B"));
                db.SaveChanges();
            }

            var currentTime = DateTime.UtcNow;
            var hasCurrentPlan = db.SchedulePlans.Any(p =>
                p.PlanStartDate <= currentTime
                && p.PlanEndDate >= currentTime
                && p.Items.Any());
            if (!hasCurrentPlan)
            {
                var orders = db.WorkOrders.OrderBy(w => w.OrderNumber).Take(2).ToList();
                var equipment = db.Equipment.OrderBy(e => e.EquipmentCode).Take(2).ToList();
                if (orders.Count > 0 && equipment.Count > 0)
                {
                    var planStart = currentTime.AddHours(-1);
                    var plan = SchedulePlan.Create("集成测试当前排产计划", planStart, planStart.AddHours(8));
                    for (var i = 0; i < orders.Count; i++)
                    {
                        plan.AddItem(ScheduleItem.Create(
                            orders[i].Id,
                            equipment[i % equipment.Count].Id,
                            planStart.AddHours(i * 2),
                            planStart.AddHours(i * 2 + 1),
                            i + 1,
                            i == 0 ? "测试首件准备 10min" : "测试换型 5min"));
                    }
                    plan.UpdateMetrics(83.0, 95.0, "集成测试当前排产计划种子");
                    db.SchedulePlans.Add(plan);
                    db.SaveChanges();
                }
            }

            var currentPlan = db.SchedulePlans
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefault(p => p.PlanStartDate <= currentTime
                    && p.PlanEndDate >= currentTime
                    && p.Items.Any());
            if (currentPlan is not null && !db.ScheduleAdoptionFeedbacks.Any(f => f.SchedulePlanId == currentPlan.Id))
            {
                db.ScheduleAdoptionFeedbacks.Add(new ScheduleAdoptionFeedback
                {
                    SchedulePlanId = currentPlan.Id,
                    WorkshopId = "ws-001",
                    OptimizationObjective = "balanced",
                    ReasonCategory = OverrideReasonCategory.UrgentInsertion,
                    ReasonDetail = "集成测试默认采纳反馈：当前排产计划已按交付、设备负载和换型风险完成复核。",
                    OperatorUser = "integration-seed",
                    AiTraceId = "TRACE-INTEGRATION-SCHEDULE-CURRENT",
                    InitiatedByAgent = true,
                    AgentDecisionId = "agent-decision-integration-current-plan",
                    AgentVersion = "integration-seed",
                    CreatedAt = currentTime
                });
                db.SaveChanges();
            }

            if (!db.AgentEvidenceLinks.Any(e => e.EvidenceType == "RiskSlaReview"))
            {
                var createdAt = DateTime.UtcNow.ToString("O");
                db.AgentEvidenceLinks.Add(new AgentEvidenceLink
                {
                    AgentDecisionId = "risk-sla-review-integration-current",
                    EvidenceType = "RiskSlaReview",
                    EvidenceKey = "risk-sla-review-integration-current",
                    EvidenceSummary = $$"""
                    {
                      "id": "risk-sla-review-integration-current",
                      "title": "集成测试风险 SLA 晨会复核包",
                      "status": "escalated",
                      "statusLabel": "已升级晨会复核",
                      "reviewMeetingId": "RISK-DAILY-INTEGRATION-CURRENT",
                      "owner": "生产经理 / 调度主管",
                      "overdueCount": 1,
                      "criticalCount": 2,
                      "affectedOrders": "WO-CURRENT-DEMO-001 / WO-CURRENT-DEMO-002",
                      "otdImpact": "-1 单延期风险待复核，预计可追回 +4% OTD",
                      "auditId": "AUD-RISK-SLA-INTEGRATION-CURRENT",
                      "traceId": "TRACE-RISK-SLA-INTEGRATION-CURRENT",
                      "createdAt": "{{createdAt}}",
                      "summary": "当前排产计划的延期、缺料与设备窗口风险已升级为晨会复核包，要求生产经理确认排产保护动作。",
                      "risks": [
                        {
                          "id": "risk-current-demo-001",
                          "type": "工单延期",
                          "title": "WO-CURRENT-DEMO-001 承诺窗口需复核",
                          "owner": "调度主管",
                          "dueAt": "今日 10:30",
                          "workOrders": "WO-CURRENT-DEMO-001",
                          "deliveryImpact": "预计延期 1 天",
                          "statusLabel": "已升级",
                          "slaStatus": "overdue",
                          "requiredAction": "确认当前计划锁定期后保护窗口。"
                        }
                      ],
                      "actions": [
                        {
                          "module": "AI 排产",
                          "owner": "调度主管",
                          "dueAt": "今日 10:30",
                          "action": "确认 WO-CURRENT-DEMO-001 的排产保护窗口并回写 OTD 证据链。",
                          "evidence": "TRACE-RISK-SLA-INTEGRATION-SCHEDULE",
                          "result": null
                        }
                      ],
                      "closedAt": null,
                      "closureAuditId": null,
                      "closureTraceId": null,
                      "closureSummary": null
                    }
                    """,
                    CreatedAt = DateTime.UtcNow
                });
                db.SaveChanges();
            }

            SeedPocEvidenceChain(db);
            SeedQualityEvidenceChain(db);
            SeedShortageSupplyEvidenceChain(db);
            SeedEngineeringBomEvidenceChain(db);
            SeedProductionAnomalyEvidenceChain(db);

            // 替换 HasData 种子用户，用 PasswordHasher 生成正确的密码哈希
            System.Console.WriteLine($"[TestDataSeedFilter] Users before: {db.SystemUsers.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Equipment before: {db.Equipment.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Materials before: {db.Materials.Count()}");

            var hasher = new PasswordHasher();

            var admin = db.SystemUsers.FirstOrDefault(u => u.Username == "admin");
            if (admin is null)
            {
                db.SystemUsers.Add(SystemUser.Create("admin", "管理员", hasher.Hash("admin123"), "Admin", "su-test-admin", DateTime.UtcNow));
            }

            var op = db.SystemUsers.FirstOrDefault(u => u.Username == "operator1");
            if (op is null)
            {
                db.SystemUsers.Add(SystemUser.Create("operator1", "操作员1", hasher.Hash("operator123"), "Operator", "su-test-operator", DateTime.UtcNow));
            }

            db.SaveChanges();
            System.Console.WriteLine($"[TestDataSeedFilter] Users after upsert: {db.SystemUsers.Count()}");

            if (!db.SystemConfigs.Any())
            {
                db.SystemConfigs.AddRange(
                    new SystemConfig
                    {
                        Id = "sc-test-001",
                        ConfigKey = "site.name",
                        ConfigValue = "AIMes 制造执行系统",
                        Description = "站点名称",
                        Category = "基本设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    },
                    new SystemConfig
                    {
                        Id = "sc-test-002",
                        ConfigKey = "shift.morning.start",
                        ConfigValue = "08:00",
                        Description = "早班开始时间",
                        Category = "排班设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    },
                    new SystemConfig
                    {
                        Id = "sc-test-003",
                        ConfigKey = "shift.morning.end",
                        ConfigValue = "20:00",
                        Description = "早班结束时间",
                        Category = "排班设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    });
                db.SaveChanges();
            }

            next(app);
        };
    }

    private static void SeedPocEvidenceChain(MesDbContext db)
    {
        var createdAt = DateTime.UtcNow;
        AddEvidenceLink(
            db,
            "CustomerOrderImportEvidence",
            "IMP-POC-INTEGRATION-CURRENT",
            new
            {
                batchId = "IMP-POC-INTEGRATION-CURRENT",
                fileName = "客户真实工单导入样例_30单.csv",
                source = "客户 IT / ERP 导出样例",
                importedOrders = 30,
                highRiskOrders = 6,
                mappedFields = new[] { "工单号", "产品", "交期", "工艺路线", "物料缺口", "设备约束" },
                preparedAt = createdAt
            },
            createdAt);

        AddEvidenceLink(
            db,
            "CustomerEquipmentFaultEvidence",
            "IMP-POC-EQ-FAULT-INTEGRATION-CURRENT",
            new
            {
                batchId = "IMP-POC-EQ-FAULT-INTEGRATION-CURRENT",
                fileName = "客户真实设备故障样例_CNC-001.csv",
                source = "客户设备联网平台 / 点检历史导出",
                equipmentCode = "CNC-001",
                faultSamples = 12,
                affectedOrders = "WO-CURRENT-DEMO-001 / WO-CURRENT-DEMO-002",
                downtimeHours = 4m,
                capturedSignals = new[] { "主轴振动", "轴承温度", "停机时长", "维修工单", "影响工单" },
                preparedAt = createdAt
            },
            createdAt);

        AddEvidenceLink(
            db,
            "PocReviewSignoff",
            "poc-review-signoff-integration-current",
            new
            {
                id = "poc-review-signoff-integration-current",
                meetingId = "POC-REVIEW-INTEGRATION-CURRENT",
                targetCustomer = "离散制造工厂 POC",
                totalScore = 92,
                passScore = 85,
                result = "approved",
                signedBy = "项目经理 / 客户代表",
                signedAt = createdAt,
                reviewers = new[] { "客户厂长", "MES 项目经理", "调度主管", "设备主管" },
                evidenceBatches = new[] { "IMP-POC-INTEGRATION-CURRENT", "EQ-FAULT-INTEGRATION-CURRENT" },
                auditId = "AUD-POC-REVIEW-INTEGRATION-CURRENT",
                summary = "POC 验收证据齐套，评分达到通过线，进入复盘签署。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "PocRolloutPackage",
            "poc-rollout-package-integration-current",
            new
            {
                id = "poc-rollout-package-integration-current",
                title = "POC 成功转上线交付行动包",
                targetCustomer = "离散制造工厂 POC",
                sourceMeetingId = "POC-REVIEW-INTEGRATION-CURRENT",
                sourceAuditId = "AUD-POC-REVIEW-INTEGRATION-CURRENT",
                status = "ready",
                statusLabel = "待客户交付启动会确认",
                rolloutWindow = "T+7 天完成试点上线准备，T+14 天进入首批真实工单运行",
                goLiveGate = "POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计",
                owner = "交付经理 / 客户厂长 / IT 负责人",
                successCriteria = new[] { "首批真实工单 >= 30 单", "责任动作均能回写统一证据链" },
                actions = new[]
                {
                    new
                    {
                        module = "交付项目",
                        owner = "交付经理",
                        action = "组织 POC 转上线启动会。",
                        dueAt = "T+1",
                        evidence = "TRACE-POC-ROLLOUT-INTEGRATION-KICKOFF"
                    }
                },
                auditId = "AUD-POC-ROLLOUT-INTEGRATION-CURRENT",
                traceId = "TRACE-POC-ROLLOUT-INTEGRATION-CURRENT",
                createdAt,
                summary = "POC 已从签署进入试点上线准备。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "PocPilotRun",
            "poc-pilot-run-integration-current",
            new
            {
                id = "poc-pilot-run-integration-current",
                title = "POC 首批真实工单试点运行确认",
                targetCustomer = "离散制造工厂 POC",
                sourcePackageId = "poc-rollout-package-integration-current",
                sourceAuditId = "AUD-POC-ROLLOUT-INTEGRATION-CURRENT",
                status = "closed",
                statusLabel = "首批真实工单已跑通",
                runWindow = "T+14 首批真实工单上线班次",
                batchId = "PILOT-WO-BATCH-INTEGRATION-CURRENT",
                sampleSize = 30,
                otdTarget = ">= 96%",
                actualOtd = "97%",
                owner = "调度主管 / 生产班组长 / 交付经理",
                workOrders = new[]
                {
                    new
                    {
                        workOrderNumber = "WO-PILOT-INTEGRATION-001",
                        productName = "急单阀体组件",
                        quantity = 12,
                        route = "CNC 精加工 -> OP-20 装配 -> 首件复检",
                        scheduleDecision = "采纳 Agent 锁定期后插入建议",
                        executionStatus = "已完工回写"
                    }
                },
                checkpoints = new[]
                {
                    new
                    {
                        module = "AI 排产",
                        owner = "调度主管",
                        status = "closed",
                        evidence = "TRACE-POC-PILOT-INTEGRATION-SCHEDULE",
                        summary = "30 单真实工单已生成排产建议，关键建议均有人工采纳原因。"
                    }
                },
                acceptanceCriteria = new[] { "30 单真实工单样本全部完成排产建议、人工确认和执行回写。" },
                auditId = "AUD-POC-PILOT-INTEGRATION-CURRENT",
                traceId = "TRACE-POC-PILOT-INTEGRATION-CURRENT",
                createdAt,
                summary = "首批 30 单真实工单已跑通排产建议采纳、生产执行、异常回写和审计复盘。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "PocHypercareAcceptance",
            "poc-hypercare-acceptance-integration-current",
            new
            {
                id = "poc-hypercare-acceptance-integration-current",
                title = "POC 正式上线验收与 Hypercare 稳定运行监控包",
                targetCustomer = "离散制造工厂 POC",
                sourcePilotRunId = "poc-pilot-run-integration-current",
                sourcePilotAuditId = "AUD-POC-PILOT-INTEGRATION-CURRENT",
                status = "active",
                statusLabel = "Hypercare 7 天稳定运行中",
                goLiveWindow = "T+15 正式上线，T+21 完成 7 天 Hypercare 验收",
                hypercareDays = 7,
                otdTarget = ">= 96%",
                actualOtd = "97%",
                oeeTarget = ">= 78%",
                currentOee = "82%",
                incidentCount = 1,
                unresolvedP1P2 = 0,
                acceptanceGate = "首批真实工单 OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付",
                owner = "客户厂长 / 交付经理 / 调度主管",
                monitors = new[]
                {
                    new
                    {
                        label = "OTD 稳定性",
                        target = ">= 96%",
                        current = "97%",
                        status = "stable",
                        statusLabel = "达标",
                        evidence = "TRACE-POC-HYPERCARE-INTEGRATION-OTD"
                    }
                },
                checkpoints = new[]
                {
                    new
                    {
                        module = "治理审计",
                        owner = "交付经理",
                        action = "导出上线验收、指标快照、责任动作和审计追踪给客户复盘。",
                        status = "active",
                        evidence = "TRACE-POC-HYPERCARE-INTEGRATION-AUDIT",
                        summary = "上线验收记录写入统一 OTD 证据链。"
                    }
                },
                auditId = "AUD-POC-HYPERCARE-INTEGRATION-CURRENT",
                traceId = "TRACE-POC-HYPERCARE-INTEGRATION-CURRENT",
                createdAt,
                summary = "POC 已进入正式上线验收，Hypercare 监控跟踪 OTD、OEE、P1/P2 和 AI 建议采纳率。"
            },
            createdAt);

        db.SaveChanges();
    }

    private static void SeedQualityEvidenceChain(MesDbContext db)
    {
        var createdAt = DateTime.UtcNow;
        AddEvidenceLink(
            db,
            "QualityReworkImpact",
            "quality-rework-impact-integration-current",
            new
            {
                inspectionId = "quality-rework-impact-integration-current",
                workOrderId = "WO-QUALITY-INTEGRATION-001",
                productCode = "PRD-QUALITY-INTEGRATION",
                processName = "热处理",
                equipmentCode = "HT-01",
                materialBatchCode = "MAT-QUALITY-6061-B03",
                batchCode = "BATCH-QUALITY-REWORK-CURRENT",
                inspectionPoint = "硬度复检",
                defectQuantity = 2,
                reworkHours = 6m,
                otdImpact = "当前质量返工影响 1 个交付窗口，需插入返工与复验时段。",
                recommendedAction = "锁定热处理返工窗口，并将复验结果回写 OTD 证据链。",
                rootCause = "热处理参数漂移导致硬度低于下限。",
                evidence = new[] { "硬度检测记录 INS-QA-CURRENT", "HT-01 炉温曲线", "WO-QUALITY-INTEGRATION-001 排产窗口" },
                createdAt
            },
            createdAt);

        AddEvidenceLink(
            db,
            "QualityMrbDisposition",
            "quality-mrb-disposition-integration-current",
            new
            {
                id = "quality-mrb-disposition-integration-current",
                title = "当前质量 MRB 处置与补料重排包",
                inspectionId = "quality-rework-impact-integration-current",
                workOrderId = "WO-QUALITY-INTEGRATION-001",
                productCode = "PRD-QUALITY-INTEGRATION",
                processName = "装配",
                equipmentCode = "ASM-01",
                materialBatchCode = "MAT-QUALITY-STEEL-A12",
                batchCode = "BATCH-QUALITY-MRB-CURRENT",
                inspectionPoint = "功能测试",
                defectPattern = "装配间隙超差",
                defectQuantity = 4,
                disposition = "scrap_rebuild",
                dispositionLabel = "报废补料重建",
                status = "closed",
                statusLabel = "MRB 处置已闭环",
                owner = "质量经理 / 生产经理",
                dueAt = "今日 15:00",
                otdImpact = "延期 +1 单风险，补料重排后预计追回。",
                scheduleImpact = "冻结原装配窗口并重排补料后装配/复检。",
                recommendedAction = "隔离不合格品，补料重建并回写复检证据。",
                auditId = "AUD-QUALITY-MRB-INTEGRATION-CURRENT",
                traceId = "TRACE-QUALITY-MRB-INTEGRATION-CURRENT",
                scheduleTraceId = "TRACE-QUALITY-MRB-SCHEDULE-INTEGRATION-CURRENT",
                createdAt,
                actions = new[]
                {
                    new
                    {
                        module = "质量闭环",
                        owner = "质量经理",
                        action = "隔离不合格批次并确认 MRB 判定。",
                        dueAt = "今日 11:30",
                        evidence = "AUD-QUALITY-MRB-INTEGRATION-CURRENT",
                        result = "closed"
                    },
                    new
                    {
                        module = "AI 排产",
                        owner = "调度主管",
                        action = "插入补料后装配与复检窗口。",
                        dueAt = "今日 15:00",
                        evidence = "TRACE-QUALITY-MRB-SCHEDULE-INTEGRATION-CURRENT",
                        result = "closed"
                    }
                },
                closureAuditId = "AUD-QUALITY-MRB-CLOSURE-INTEGRATION-CURRENT",
                closureTraceId = "TRACE-QUALITY-MRB-CLOSURE-INTEGRATION-CURRENT",
                closureSummary = "MRB 判定、补料重排、复检窗口均已写入统一证据链。",
                closedAt = createdAt,
                closedBy = "quality-manager"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "QualityCapaClosure",
            "quality-capa-closure-integration-current",
            new
            {
                inspectionId = "quality-capa-closure-integration-current",
                workOrderId = "WO-QUALITY-INTEGRATION-001",
                traceId = "TRACE-QUALITY-CAPA-INTEGRATION-CURRENT",
                rootCause = "热处理参数漂移与首件复核间隔过长共同导致返工。",
                evidenceStrength = 0.91m,
                taskTitle = "热处理参数漂移 CAPA 闭环复核",
                taskKind = "process-control",
                owner = "质量经理 / 工艺工程师",
                dueAt = "今日 16:00",
                verification = "复验硬度合格，炉温曲线与首件复核记录已归档。",
                verifiedAt = createdAt.ToString("O"),
                auditState = "closed",
                otdImpact = "返工窗口已纳入排产，OTD 风险已从高降为中。",
                reviewAction = "下次热处理批次开工前强制执行首件复核与参数双签。"
            },
            createdAt);

        db.SaveChanges();
    }

    private static void SeedShortageSupplyEvidenceChain(MesDbContext db)
    {
        var createdAt = DateTime.UtcNow;
        AddEvidenceLink(
            db,
            "ShortageKittingEvent",
            "WO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION",
            new
            {
                materialCode = "MAT-SHORTAGE-INTEGRATION",
                materialName = "伺服驱动器",
                workOrderNumber = "WO-SHORTAGE-INTEGRATION-001",
                affectedOrders = "WO-SHORTAGE-INTEGRATION-001 / WO-SHORTAGE-INTEGRATION-002",
                requiredQuantity = 120m,
                availableQuantity = 84m,
                inboundQuantity = 16m,
                shortageQuantity = 20m,
                window = "今日 14:00 前必须齐套",
                suggestion = "优先释放已到货 16 件并触发采购替代供应商承诺，剩余 20 件进入供应风险升级。",
                createdAt
            },
            createdAt);

        AddEvidenceLink(
            db,
            "ShortageRiskResolution",
            "PO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION",
            new
            {
                materialCode = "MAT-SHORTAGE-INTEGRATION",
                materialName = "伺服驱动器",
                affectedOrders = "WO-SHORTAGE-INTEGRATION-001 / WO-SHORTAGE-INTEGRATION-002",
                sourceOrderNumber = "PO-SHORTAGE-INTEGRATION-001",
                receivedQuantity = 20m,
                unit = "pcs",
                availableQuantity = 120m,
                resolvedAt = createdAt,
                message = "PO-SHORTAGE-INTEGRATION-001 已补齐 20 pcs，缺料风险关闭，可释放 AI 排产复核。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "SupplyRiskEscalation",
            "PO-SUPPLY-INTEGRATION-001:MAT-SUPPLY-INTEGRATION",
            new
            {
                purchaseOrderNumber = "PO-SUPPLY-INTEGRATION-001",
                materialCode = "MAT-SUPPLY-INTEGRATION",
                materialName = "高精密轴承",
                supplierName = "北方精密协作厂",
                originalDeliveryDate = createdAt.Date.AddDays(1),
                promisedDeliveryDate = createdAt.Date.AddDays(4),
                delayDays = 3,
                affectedOrders = "WO-SUPPLY-INTEGRATION-001 / WO-SUPPLY-INTEGRATION-002",
                alternateSupplierName = "华东快供二厂",
                alternatePromiseDate = createdAt.Date.AddDays(1).ToString("yyyy-MM-dd"),
                decision = "alternate_committed",
                statusLabel = "替代供应商承诺已锁定",
                auditId = "AUD-SUPPLY-RISK-INTEGRATION-CURRENT",
                traceId = "TRACE-SUPPLY-RISK-INTEGRATION-CURRENT",
                message = "北方精密协作厂延期 3 天，华东快供二厂承诺 T+1 到货，受影响工单进入排产复核。",
                createdAt,
                receivedAt = (DateTime?)null,
                receivedQuantity = (decimal?)null,
                receiptAuditId = (string?)null,
                receiptTraceId = (string?)null,
                receiptMessage = (string?)null
            },
            createdAt);

        AddEvidenceLink(
            db,
            "SupplierNetworkDecision",
            "MAT-SUPPLY-INTEGRATION:华东快供二厂",
            new
            {
                materialCode = "MAT-SUPPLY-INTEGRATION",
                materialName = "高精密轴承",
                affectedOrders = "WO-SUPPLY-INTEGRATION-001 / WO-SUPPLY-INTEGRATION-002",
                selectedSupplierName = "华东快供二厂",
                selectedPromiseDate = createdAt.Date.AddDays(1).ToString("yyyy-MM-dd"),
                selectedPerformanceScore = 94.5m,
                selectedOnTimeRate = 98m,
                selectedQuotedPrice = 128m,
                selectedCapacityQuantity = 80m,
                candidates = new[]
                {
                    new
                    {
                        supplierName = "华东快供二厂",
                        promiseDate = createdAt.Date.AddDays(1).ToString("yyyy-MM-dd"),
                        quotedPrice = 128m,
                        capacityQuantity = 80m,
                        onTimeRate = 98m,
                        defectRate = 0.4m,
                        performanceScore = 94.5m,
                        slaLeadTimeHours = 18,
                        slaStatus = "preferred",
                        riskNote = "准交率高且具备当日锁产能力。"
                    },
                    new
                    {
                        supplierName = "北方精密协作厂",
                        promiseDate = createdAt.Date.AddDays(4).ToString("yyyy-MM-dd"),
                        quotedPrice = 119m,
                        capacityQuantity = 120m,
                        onTimeRate = 82m,
                        defectRate = 1.2m,
                        performanceScore = 73m,
                        slaLeadTimeHours = 72,
                        slaStatus = "breached",
                        riskNote = "当前 PO 延期 3 天，保留观察。"
                    }
                },
                statusLabel = "供应商恢复方案已推荐",
                auditId = "AUD-SUPPLIER-NETWORK-INTEGRATION-CURRENT",
                traceId = "TRACE-SUPPLIER-NETWORK-INTEGRATION-CURRENT",
                message = "按 SLA、准交率、价格与产能评分，推荐华东快供二厂接管 MAT-SUPPLY-INTEGRATION 恢复供应。",
                createdAt
            },
            createdAt);

        db.SaveChanges();
    }

    private static void SeedEngineeringBomEvidenceChain(MesDbContext db)
    {
        var createdAt = DateTime.UtcNow;
        AddEvidenceLink(
            db,
            "BomKittingPackage",
            "bom-kitting-package-integration-current",
            new
            {
                id = "bom-kitting-package-integration-current",
                bomCode = "BOM-ENG-INTEGRATION",
                bomVersion = "V2.1",
                productName = "急单阀体组件",
                workOrderNumber = "WO-ENG-INTEGRATION-001",
                scheduleWindow = "今日 14:00-18:00",
                statusLabel = "齐套包已生成",
                owner = "物料计划员 / 工艺工程师",
                auditId = "AUD-BOM-KITTING-INTEGRATION-CURRENT",
                traceId = "TRACE-BOM-KITTING-INTEGRATION-CURRENT",
                createdAt,
                summary = "BOM 展开、缺料识别、替代料状态与 OTD 证据链已完成齐套复核。",
                items = new[]
                {
                    new
                    {
                        materialCode = "MAT-SHORTAGE-INTEGRATION",
                        materialName = "伺服驱动器",
                        requiredQuantity = 120m,
                        availableQuantity = 120m,
                        inboundQuantity = 0m,
                        shortageQuantity = 0m,
                        unit = "pcs",
                        action = "已按缺料恢复记录释放排产复核。"
                    },
                    new
                    {
                        materialCode = "MAT-SUPPLY-INTEGRATION",
                        materialName = "高精密轴承",
                        requiredQuantity = 80m,
                        availableQuantity = 64m,
                        inboundQuantity = 16m,
                        shortageQuantity = 0m,
                        unit = "pcs",
                        action = "华东快供二厂 T+1 承诺已纳入供应恢复方案。"
                    }
                }
            },
            createdAt);

        AddEvidenceLink(
            db,
            "AlternateMaterialApproval",
            "alternate-material-approval-integration-current",
            new
            {
                id = "alternate-material-approval-integration-current",
                bomCode = "BOM-ENG-INTEGRATION",
                bomVersion = "V2.1",
                sourceMaterialCode = "MAT-OLD-AL6061",
                alternateMaterialCode = "MAT-ALT-AL6061B",
                alternateMaterialName = "铝棒 6061B 替代批",
                affectedOrders = "WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002",
                approvedBy = "工艺工程师 / 质量经理",
                approvedAt = createdAt,
                auditId = "AUD-ALT-MATERIAL-INTEGRATION-CURRENT",
                traceId = "TRACE-ALT-MATERIAL-INTEGRATION-CURRENT",
                status = "approved",
                summary = "替代料已按质量、库存和供应约束完成双签，可进入排产齐套复核。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "EngineeringChangeImpact",
            "engineering-change-impact-integration-current",
            new
            {
                id = "engineering-change-impact-integration-current",
                changeId = "ECN-INTEGRATION-CURRENT",
                bomCode = "BOM-ENG-INTEGRATION",
                bomVersion = "V2.1",
                changeTitle = "阀体组件材料替代与工艺路线微调",
                sourceMaterialCode = "MAT-OLD-AL6061",
                alternateMaterialCode = "MAT-ALT-AL6061B",
                alternateMaterialName = "铝棒 6061B 替代批",
                affectedOrders = "WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002",
                inventoryImpact = "旧料库存不足，替代料可覆盖当前两单。",
                qualityImpact = "需追加首件硬度与尺寸复核。",
                supplierImpact = "华东快供二厂 T+1 承诺满足恢复窗口。",
                costImpact = "单件成本 +1.8%，低于延期罚损。",
                otdImpact = "预计追回 1 单延期风险。",
                scheduleWindow = "今日 14:00-18:00",
                recommendedDecision = "批准替代料并释放路线能力复核。",
                analyzedBy = "工艺工程师",
                analyzedAt = createdAt,
                auditId = "AUD-ENGINEERING-CHANGE-INTEGRATION-CURRENT",
                traceId = "TRACE-ENGINEERING-CHANGE-INTEGRATION-CURRENT",
                decision = "approved",
                decisionLabel = "已批准",
                decidedBy = "工程经理",
                decidedAt = createdAt,
                decisionReason = "OTD 风险高于替代料成本与质量复核风险。",
                decisionAuditId = "AUD-ENGINEERING-CHANGE-DECISION-INTEGRATION-CURRENT",
                statusLabel = "工程变更已放行",
                summary = "工程变更影响已完成库存、质量、供应、成本与 OTD 评估。"
            },
            createdAt);

        AddEvidenceLink(
            db,
            "RouteCapabilityValidation",
            "route-capability-validation-integration-current",
            new
            {
                id = "route-capability-validation-integration-current",
                routeCode = "ROUTE-ENG-INTEGRATION",
                routeVersion = "V3.4",
                routeName = "阀体组件 CNC 精加工路线",
                operationCode = "OP-20",
                operationName = "CNC 精加工",
                bottleneckResource = "CNC-01",
                candidateEquipment = "CNC-03",
                affectedOrders = "WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002",
                capacityGapHours = 3.5m,
                changeoverMinutes = 18m,
                batchWindow = "今日 15:00-19:00",
                decision = "released",
                validatedBy = "工艺工程师",
                validatedAt = createdAt,
                approvedBy = "生产经理",
                approvedAt = createdAt,
                auditId = "AUD-ROUTE-CAPABILITY-INTEGRATION-CURRENT",
                traceId = "TRACE-ROUTE-CAPABILITY-INTEGRATION-CURRENT",
                statusLabel = "路线能力已放行",
                summary = "CNC-03 可承接 OP-20 精加工，换型 18 分钟，容量缺口已关闭。"
            },
            createdAt);

        db.SaveChanges();
    }

    private static void SeedProductionAnomalyEvidenceChain(MesDbContext db)
    {
        var createdAt = DateTime.UtcNow;
        AddEvidenceLink(
            db,
            "ProductionAnomalyEvent",
            "production-anomaly-event-integration-current",
            new
            {
                id = "production-anomaly-event-integration-current",
                workOrderNumber = "WO-RISK-INTEGRATION-001",
                operationCode = "OP-020",
                operationName = "CNC 精加工",
                equipmentId = "CNC-001",
                anomalyType = "equipment",
                severity = "Critical",
                title = "CNC-001 主轴温升异常",
                description = "现场上报主轴温度超过阈值，触发风险处置队列与异常分流。",
                detectedAt = createdAt.ToString("O"),
                detectedBy = "operator.risk",
                suggestedAction = "停机保护并切换 CNC-003 分流，保留风险队列与审计追踪。"
            },
            createdAt);

        db.SaveChanges();
    }

    private static void AddEvidenceLink(MesDbContext db, string evidenceType, string evidenceKey, object payload, DateTime createdAt)
    {
        if (db.AgentEvidenceLinks.Any(e => e.EvidenceType == evidenceType && e.EvidenceKey == evidenceKey)) return;

        db.AgentEvidenceLinks.Add(new AgentEvidenceLink
        {
            AgentDecisionId = evidenceKey,
            EvidenceType = evidenceType,
            EvidenceKey = evidenceKey,
            EvidenceSummary = JsonSerializer.Serialize(payload),
            CreatedAt = createdAt
        });
    }
}
