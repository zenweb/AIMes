-- Ensure local/staging demo databases have a usable current schedule plan.
-- Idempotent: does nothing when a current plan with schedule items already exists.

DO $$
DECLARE
    current_plan_exists boolean;
    equipment_count integer;
    plan_id text;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM schedule_plans p
        WHERE p.plan_start_date <= NOW()
          AND p.plan_end_date >= NOW()
          AND EXISTS (
              SELECT 1
              FROM schedule_items i
              WHERE i."SchedulePlanId" = p.id
          )
    ) INTO current_plan_exists;

    IF current_plan_exists THEN
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM work_orders) THEN
        INSERT INTO work_orders (
            id,
            order_number,
            product_code,
            product_name,
            planned_quantity,
            completed_quantity,
            planned_start_date,
            planned_end_date,
            status,
            workshop_id,
            route_code,
            priority,
            created_at,
            updated_at
        )
        VALUES
            ('wo-current-demo-001', 'WO-CURRENT-DEMO-001', 'PROD-A', '当前演示转接座 A', 120, 0, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '2 days', 'Created', 'ws-001', 'R-PRODA-V1', 1, NOW(), NULL),
            ('wo-current-demo-002', 'WO-CURRENT-DEMO-002', 'PROD-B', '当前演示阀体 B', 80, 0, NOW(), NOW() + INTERVAL '3 days', 'Created', 'ws-001', 'R-PRODB-V1', 2, NOW(), NULL),
            ('wo-current-demo-003', 'WO-CURRENT-DEMO-003', 'PROD-C', '当前演示外壳 C', 60, 0, NOW(), NOW() + INTERVAL '4 days', 'Created', 'ws-001', 'R-PRODC-V1', 3, NOW(), NULL)
        ON CONFLICT (order_number) DO NOTHING;
    END IF;

    SELECT COUNT(*) INTO equipment_count FROM equipment;
    IF equipment_count = 0 THEN
        RAISE NOTICE 'Skipped current schedule plan seed because equipment is empty.';
        RETURN;
    END IF;

    plan_id := 'plan-current-demo-' || to_char(NOW(), 'YYYYMMDDHH24MISS');

    INSERT INTO schedule_plans (
        id,
        plan_name,
        plan_start_date,
        plan_end_date,
        overall_utilization_rate,
        on_time_delivery_rate,
        optimization_notes,
        created_at
    )
    VALUES (
        plan_id,
        '当前演示排产计划',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '7 days',
        0.83,
        0.95,
        '当前演示排产计划补齐脚本：保证 /api/v1/scheduling/current 可返回真实计划与排产项。',
        NOW()
    );

    WITH numbered_orders AS (
        SELECT id, order_number, row_number() OVER (ORDER BY order_number) AS rn
        FROM work_orders
        ORDER BY order_number
        LIMIT 3
    ),
    numbered_equipment AS (
        SELECT id, row_number() OVER (ORDER BY equipment_code) AS rn
        FROM equipment
    )
    INSERT INTO schedule_items (
        id,
        "SchedulePlanId",
        work_order_id,
        equipment_id,
        planned_start_time,
        planned_end_time,
        sequence,
        setup_time,
        "DependentItems"
    )
    SELECT
        'si-current-demo-' || o.rn || '-' || to_char(NOW(), 'YYYYMMDDHH24MISS'),
        plan_id,
        o.id,
        e.id,
        NOW() + ((o.rn - 1) * INTERVAL '2 hours'),
        NOW() + (((o.rn - 1) * 2 + 1) * INTERVAL '1 hour'),
        o.rn,
        CASE WHEN o.rn = 1 THEN '首件准备 15min' ELSE '换型 10min' END,
        '{}'
    FROM numbered_orders o
    JOIN numbered_equipment e
      ON e.rn = ((o.rn - 1) % equipment_count) + 1;
END $$;

INSERT INTO schedule_adoption_feedbacks (
    id,
    schedule_plan_id,
    workshop_id,
    optimization_objective,
    original_assignments_json,
    modified_assignments_json,
    reason_category,
    reason_detail,
    moved_order_ids_json,
    operator_user,
    ai_trace_id,
    initiated_by_agent,
    agent_decision_id,
    agent_version,
    created_at
)
SELECT
    'feedback-current-demo-' || p.id,
    p.id,
    'ws-001',
    'balanced',
    '[]'::jsonb,
    '[]'::jsonb,
    'UrgentInsertion',
    '当前演示排产计划已按交付、设备负载和换型风险完成复核，可作为 AI 排产采纳反馈样例。',
    '[]'::jsonb,
    'demo-seed',
    'TRACE-DEMO-SCHEDULE-CURRENT',
    true,
    'agent-decision-demo-current-plan',
    'demo-seed',
    NOW()
FROM schedule_plans p
WHERE p.plan_start_date <= NOW()
  AND p.plan_end_date >= NOW()
  AND EXISTS (
      SELECT 1
      FROM schedule_items i
      WHERE i."SchedulePlanId" = p.id
  )
  AND NOT EXISTS (
      SELECT 1
      FROM schedule_adoption_feedbacks f
      WHERE f.schedule_plan_id = p.id
        AND f.reason_detail IS NOT NULL
        AND trim(f.reason_detail) <> ''
  )
ORDER BY p.created_at DESC
LIMIT 1;

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
SELECT
    'evidence-risk-sla-current-demo',
    'risk-sla-review-demo-current',
    'RiskSlaReview',
    'risk-sla-review-demo-current',
    jsonb_build_object(
        'id', 'risk-sla-review-demo-current',
        'title', '当前排产风险 SLA 晨会复核包',
        'status', 'escalated',
        'statusLabel', '已升级晨会复核',
        'reviewMeetingId', 'RISK-DAILY-DEMO-CURRENT',
        'owner', '生产经理 / 调度主管 / 采购主管',
        'overdueCount', 1,
        'criticalCount', 2,
        'affectedOrders', 'WO-CURRENT-DEMO-001 / WO-CURRENT-DEMO-002',
        'otdImpact', '-1 单延期风险待复核，预计可追回 +4% OTD',
        'auditId', 'AUD-RISK-SLA-DEMO-CURRENT',
        'traceId', 'TRACE-RISK-SLA-DEMO-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'summary', '当前排产计划的延期、缺料与设备窗口风险已升级为晨会复核包，要求生产经理确认排产保护、采购承诺与设备窗口。',
        'risks', jsonb_build_array(
            jsonb_build_object(
                'id', 'risk-current-demo-001',
                'type', '工单延期',
                'title', 'WO-CURRENT-DEMO-001 承诺窗口需复核',
                'owner', '调度主管',
                'dueAt', '今日 10:30',
                'workOrders', 'WO-CURRENT-DEMO-001',
                'deliveryImpact', '预计延期 1 天',
                'statusLabel', '已升级',
                'slaStatus', 'overdue',
                'requiredAction', '确认当前计划锁定期后保护窗口。'
            ),
            jsonb_build_object(
                'id', 'risk-current-demo-002',
                'type', '供应风险',
                'title', 'WO-CURRENT-DEMO-002 物料承诺需复核',
                'owner', '采购主管',
                'dueAt', '今日 11:00',
                'workOrders', 'WO-CURRENT-DEMO-002',
                'deliveryImpact', '影响后续装配窗口',
                'statusLabel', '关键关注',
                'slaStatus', 'critical',
                'requiredAction', '确认替代料或加急到货承诺。'
            )
        ),
        'actions', jsonb_build_array(
            jsonb_build_object(
                'module', 'AI 排产',
                'owner', '调度主管',
                'dueAt', '今日 10:30',
                'action', '确认 WO-CURRENT-DEMO-001 的排产保护窗口并回写 OTD 证据链。',
                'evidence', 'TRACE-RISK-SLA-DEMO-SCHEDULE',
                'result', NULL
            ),
            jsonb_build_object(
                'module', '采购协同',
                'owner', '采购主管',
                'dueAt', '今日 11:00',
                'action', '确认 WO-CURRENT-DEMO-002 的物料承诺或替代料窗口。',
                'evidence', 'TRACE-RISK-SLA-DEMO-PURCHASE',
                'result', NULL
            )
        ),
        'closedAt', NULL,
        'closureAuditId', NULL,
        'closureTraceId', NULL,
        'closureSummary', NULL
    )::text,
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM agent_evidence_links
    WHERE evidence_type = 'RiskSlaReview'
);

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
VALUES
(
    'evidence-customer-order-import-integration-current',
    'IMP-POC-INTEGRATION-CURRENT',
    'CustomerOrderImportEvidence',
    'IMP-POC-INTEGRATION-CURRENT',
    jsonb_build_object(
        'batchId', 'IMP-POC-INTEGRATION-CURRENT',
        'fileName', '客户真实工单导入样例_30单.csv',
        'source', '客户 IT / ERP 导出样例',
        'importedOrders', 30,
        'highRiskOrders', 6,
        'mappedFields', jsonb_build_array('工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'),
        'preparedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    NOW()
),
(
    'evidence-customer-equipment-fault-integration-current',
    'IMP-POC-EQ-FAULT-INTEGRATION-CURRENT',
    'CustomerEquipmentFaultEvidence',
    'IMP-POC-EQ-FAULT-INTEGRATION-CURRENT',
    jsonb_build_object(
        'batchId', 'IMP-POC-EQ-FAULT-INTEGRATION-CURRENT',
        'fileName', '客户真实设备故障样例_CNC-001.csv',
        'source', '客户设备联网平台 / 点检历史导出',
        'equipmentCode', 'CNC-001',
        'faultSamples', 12,
        'affectedOrders', 'WO-CURRENT-DEMO-001 / WO-CURRENT-DEMO-002',
        'downtimeHours', 4,
        'capturedSignals', jsonb_build_array('主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'),
        'preparedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    NOW()
),
(
    'evidence-poc-review-signoff-integration-current',
    'poc-review-signoff-integration-current',
    'PocReviewSignoff',
    'poc-review-signoff-integration-current',
    jsonb_build_object(
        'id', 'poc-review-signoff-integration-current',
        'meetingId', 'POC-REVIEW-INTEGRATION-CURRENT',
        'targetCustomer', '离散制造工厂 POC',
        'totalScore', 92,
        'passScore', 85,
        'result', 'approved',
        'signedBy', '项目经理 / 客户代表',
        'signedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'reviewers', jsonb_build_array('客户厂长', 'MES 项目经理', '调度主管', '设备主管'),
        'evidenceBatches', jsonb_build_array('IMP-POC-INTEGRATION-CURRENT', 'EQ-FAULT-INTEGRATION-CURRENT'),
        'auditId', 'AUD-POC-REVIEW-INTEGRATION-CURRENT',
        'summary', 'POC 验收证据齐套，评分达到通过线，进入复盘签署。'
    )::text,
    NOW()
),
(
    'evidence-poc-rollout-package-integration-current',
    'poc-rollout-package-integration-current',
    'PocRolloutPackage',
    'poc-rollout-package-integration-current',
    jsonb_build_object(
        'id', 'poc-rollout-package-integration-current',
        'title', 'POC 成功转上线交付行动包',
        'targetCustomer', '离散制造工厂 POC',
        'sourceMeetingId', 'POC-REVIEW-INTEGRATION-CURRENT',
        'sourceAuditId', 'AUD-POC-REVIEW-INTEGRATION-CURRENT',
        'status', 'ready',
        'statusLabel', '待客户交付启动会确认',
        'rolloutWindow', 'T+7 天完成试点上线准备，T+14 天进入首批真实工单运行',
        'goLiveGate', 'POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计',
        'owner', '交付经理 / 客户厂长 / IT 负责人',
        'successCriteria', jsonb_build_array('首批真实工单 >= 30 单', '责任动作均能回写统一证据链'),
        'actions', jsonb_build_array(jsonb_build_object(
            'module', '交付项目',
            'owner', '交付经理',
            'action', '组织 POC 转上线启动会。',
            'dueAt', 'T+1',
            'evidence', 'TRACE-POC-ROLLOUT-INTEGRATION-KICKOFF'
        )),
        'auditId', 'AUD-POC-ROLLOUT-INTEGRATION-CURRENT',
        'traceId', 'TRACE-POC-ROLLOUT-INTEGRATION-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'summary', 'POC 已从签署进入试点上线准备。'
    )::text,
    NOW()
),
(
    'evidence-poc-pilot-run-integration-current',
    'poc-pilot-run-integration-current',
    'PocPilotRun',
    'poc-pilot-run-integration-current',
    jsonb_build_object(
        'id', 'poc-pilot-run-integration-current',
        'title', 'POC 首批真实工单试点运行确认',
        'targetCustomer', '离散制造工厂 POC',
        'sourcePackageId', 'poc-rollout-package-integration-current',
        'sourceAuditId', 'AUD-POC-ROLLOUT-INTEGRATION-CURRENT',
        'status', 'closed',
        'statusLabel', '首批真实工单已跑通',
        'runWindow', 'T+14 首批真实工单上线班次',
        'batchId', 'PILOT-WO-BATCH-INTEGRATION-CURRENT',
        'sampleSize', 30,
        'otdTarget', '>= 96%',
        'actualOtd', '97%',
        'owner', '调度主管 / 生产班组长 / 交付经理',
        'workOrders', jsonb_build_array(jsonb_build_object(
            'workOrderNumber', 'WO-PILOT-INTEGRATION-001',
            'productName', '急单阀体组件',
            'quantity', 12,
            'route', 'CNC 精加工 -> OP-20 装配 -> 首件复检',
            'scheduleDecision', '采纳 Agent 锁定期后插入建议',
            'executionStatus', '已完工回写'
        )),
        'checkpoints', jsonb_build_array(jsonb_build_object(
            'module', 'AI 排产',
            'owner', '调度主管',
            'status', 'closed',
            'evidence', 'TRACE-POC-PILOT-INTEGRATION-SCHEDULE',
            'summary', '30 单真实工单已生成排产建议，关键建议均有人工采纳原因。'
        )),
        'acceptanceCriteria', jsonb_build_array('30 单真实工单样本全部完成排产建议、人工确认和执行回写。'),
        'auditId', 'AUD-POC-PILOT-INTEGRATION-CURRENT',
        'traceId', 'TRACE-POC-PILOT-INTEGRATION-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'summary', '首批 30 单真实工单已跑通排产建议采纳、生产执行、异常回写和审计复盘。'
    )::text,
    NOW()
),
(
    'evidence-poc-hypercare-acceptance-integration-current',
    'poc-hypercare-acceptance-integration-current',
    'PocHypercareAcceptance',
    'poc-hypercare-acceptance-integration-current',
    jsonb_build_object(
        'id', 'poc-hypercare-acceptance-integration-current',
        'title', 'POC 正式上线验收与 Hypercare 稳定运行监控包',
        'targetCustomer', '离散制造工厂 POC',
        'sourcePilotRunId', 'poc-pilot-run-integration-current',
        'sourcePilotAuditId', 'AUD-POC-PILOT-INTEGRATION-CURRENT',
        'status', 'active',
        'statusLabel', 'Hypercare 7 天稳定运行中',
        'goLiveWindow', 'T+15 正式上线，T+21 完成 7 天 Hypercare 验收',
        'hypercareDays', 7,
        'otdTarget', '>= 96%',
        'actualOtd', '97%',
        'oeeTarget', '>= 78%',
        'currentOee', '82%',
        'incidentCount', 1,
        'unresolvedP1P2', 0,
        'acceptanceGate', '首批真实工单 OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付',
        'owner', '客户厂长 / 交付经理 / 调度主管',
        'monitors', jsonb_build_array(jsonb_build_object(
            'label', 'OTD 稳定性',
            'target', '>= 96%',
            'current', '97%',
            'status', 'stable',
            'statusLabel', '达标',
            'evidence', 'TRACE-POC-HYPERCARE-INTEGRATION-OTD'
        )),
        'checkpoints', jsonb_build_array(jsonb_build_object(
            'module', '治理审计',
            'owner', '交付经理',
            'action', '导出上线验收、指标快照、责任动作和审计追踪给客户复盘。',
            'status', 'active',
            'evidence', 'TRACE-POC-HYPERCARE-INTEGRATION-AUDIT',
            'summary', '上线验收记录写入统一 OTD 证据链。'
        )),
        'auditId', 'AUD-POC-HYPERCARE-INTEGRATION-CURRENT',
        'traceId', 'TRACE-POC-HYPERCARE-INTEGRATION-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'summary', 'POC 已进入正式上线验收，Hypercare 监控跟踪 OTD、OEE、P1/P2 和 AI 建议采纳率。'
    )::text,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
VALUES
(
    'evidence-production-anomaly-event-integration-current',
    'production-anomaly-production-anomaly-event-integration-current',
    'ProductionAnomalyEvent',
    'production-anomaly-event-integration-current',
    jsonb_build_object(
        'id', 'production-anomaly-event-integration-current',
        'workOrderNumber', 'WO-RISK-INTEGRATION-001',
        'operationCode', 'OP-020',
        'operationName', 'CNC 精加工',
        'equipmentId', 'CNC-001',
        'anomalyType', 'equipment',
        'severity', 'Critical',
        'title', 'CNC-001 主轴温升异常',
        'description', '现场上报主轴温度超过阈值，触发风险处置队列与异常分流。',
        'detectedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'detectedBy', 'operator.risk',
        'suggestedAction', '停机保护并切换 CNC-003 分流，保留风险队列与审计追踪。'
    )::text,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
VALUES
(
    'evidence-bom-kitting-package-integration-current',
    'bom-kitting-package-bom-kitting-package-integration-current',
    'BomKittingPackage',
    'bom-kitting-package-integration-current',
    jsonb_build_object(
        'id', 'bom-kitting-package-integration-current',
        'bomCode', 'BOM-ENG-INTEGRATION',
        'bomVersion', 'V2.1',
        'productName', '急单阀体组件',
        'workOrderNumber', 'WO-ENG-INTEGRATION-001',
        'scheduleWindow', '今日 14:00-18:00',
        'statusLabel', '齐套包已生成',
        'owner', '物料计划员 / 工艺工程师',
        'auditId', 'AUD-BOM-KITTING-INTEGRATION-CURRENT',
        'traceId', 'TRACE-BOM-KITTING-INTEGRATION-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'summary', 'BOM 展开、缺料识别、替代料状态与 OTD 证据链已完成齐套复核。',
        'items', jsonb_build_array(
            jsonb_build_object(
                'materialCode', 'MAT-SHORTAGE-INTEGRATION',
                'materialName', '伺服驱动器',
                'requiredQuantity', 120,
                'availableQuantity', 120,
                'inboundQuantity', 0,
                'shortageQuantity', 0,
                'unit', 'pcs',
                'action', '已按缺料恢复记录释放排产复核。'
            ),
            jsonb_build_object(
                'materialCode', 'MAT-SUPPLY-INTEGRATION',
                'materialName', '高精密轴承',
                'requiredQuantity', 80,
                'availableQuantity', 64,
                'inboundQuantity', 16,
                'shortageQuantity', 0,
                'unit', 'pcs',
                'action', '华东快供二厂 T+1 承诺已纳入供应恢复方案。'
            )
        )
    )::text,
    NOW()
),
(
    'evidence-alternate-material-approval-integration-current',
    'alternate-material-alternate-material-approval-integration-current',
    'AlternateMaterialApproval',
    'alternate-material-approval-integration-current',
    jsonb_build_object(
        'id', 'alternate-material-approval-integration-current',
        'bomCode', 'BOM-ENG-INTEGRATION',
        'bomVersion', 'V2.1',
        'sourceMaterialCode', 'MAT-OLD-AL6061',
        'alternateMaterialCode', 'MAT-ALT-AL6061B',
        'alternateMaterialName', '铝棒 6061B 替代批',
        'affectedOrders', 'WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002',
        'approvedBy', '工艺工程师 / 质量经理',
        'approvedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'auditId', 'AUD-ALT-MATERIAL-INTEGRATION-CURRENT',
        'traceId', 'TRACE-ALT-MATERIAL-INTEGRATION-CURRENT',
        'status', 'approved',
        'summary', '替代料已按质量、库存和供应约束完成双签，可进入排产齐套复核。'
    )::text,
    NOW()
),
(
    'evidence-engineering-change-impact-integration-current',
    'engineering-change-engineering-change-impact-integration-current',
    'EngineeringChangeImpact',
    'engineering-change-impact-integration-current',
    jsonb_build_object(
        'id', 'engineering-change-impact-integration-current',
        'changeId', 'ECN-INTEGRATION-CURRENT',
        'bomCode', 'BOM-ENG-INTEGRATION',
        'bomVersion', 'V2.1',
        'changeTitle', '阀体组件材料替代与工艺路线微调',
        'sourceMaterialCode', 'MAT-OLD-AL6061',
        'alternateMaterialCode', 'MAT-ALT-AL6061B',
        'alternateMaterialName', '铝棒 6061B 替代批',
        'affectedOrders', 'WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002',
        'inventoryImpact', '旧料库存不足，替代料可覆盖当前两单。',
        'qualityImpact', '需追加首件硬度与尺寸复核。',
        'supplierImpact', '华东快供二厂 T+1 承诺满足恢复窗口。',
        'costImpact', '单件成本 +1.8%，低于延期罚损。',
        'otdImpact', '预计追回 1 单延期风险。',
        'scheduleWindow', '今日 14:00-18:00',
        'recommendedDecision', '批准替代料并释放路线能力复核。',
        'analyzedBy', '工艺工程师',
        'analyzedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'auditId', 'AUD-ENGINEERING-CHANGE-INTEGRATION-CURRENT',
        'traceId', 'TRACE-ENGINEERING-CHANGE-INTEGRATION-CURRENT',
        'decision', 'approved',
        'decisionLabel', '已批准',
        'decidedBy', '工程经理',
        'decidedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'decisionReason', 'OTD 风险高于替代料成本与质量复核风险。',
        'decisionAuditId', 'AUD-ENGINEERING-CHANGE-DECISION-INTEGRATION-CURRENT',
        'statusLabel', '工程变更已放行',
        'summary', '工程变更影响已完成库存、质量、供应、成本与 OTD 评估。'
    )::text,
    NOW()
),
(
    'evidence-route-capability-validation-integration-current',
    'route-capability-route-capability-validation-integration-current',
    'RouteCapabilityValidation',
    'route-capability-validation-integration-current',
    jsonb_build_object(
        'id', 'route-capability-validation-integration-current',
        'routeCode', 'ROUTE-ENG-INTEGRATION',
        'routeVersion', 'V3.4',
        'routeName', '阀体组件 CNC 精加工路线',
        'operationCode', 'OP-20',
        'operationName', 'CNC 精加工',
        'bottleneckResource', 'CNC-01',
        'candidateEquipment', 'CNC-03',
        'affectedOrders', 'WO-ENG-INTEGRATION-001 / WO-ENG-INTEGRATION-002',
        'capacityGapHours', 3.5,
        'changeoverMinutes', 18,
        'batchWindow', '今日 15:00-19:00',
        'decision', 'released',
        'validatedBy', '工艺工程师',
        'validatedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'approvedBy', '生产经理',
        'approvedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'auditId', 'AUD-ROUTE-CAPABILITY-INTEGRATION-CURRENT',
        'traceId', 'TRACE-ROUTE-CAPABILITY-INTEGRATION-CURRENT',
        'statusLabel', '路线能力已放行',
        'summary', 'CNC-03 可承接 OP-20 精加工，换型 18 分钟，容量缺口已关闭。'
    )::text,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
VALUES
(
    'evidence-shortage-kitting-integration-current',
    'shortage-kitting-WO-SHORTAGE-INTEGRATION-001-MAT-SHORTAGE-INTEGRATION',
    'ShortageKittingEvent',
    'WO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION',
    jsonb_build_object(
        'materialCode', 'MAT-SHORTAGE-INTEGRATION',
        'materialName', '伺服驱动器',
        'workOrderNumber', 'WO-SHORTAGE-INTEGRATION-001',
        'affectedOrders', 'WO-SHORTAGE-INTEGRATION-001 / WO-SHORTAGE-INTEGRATION-002',
        'requiredQuantity', 120,
        'availableQuantity', 84,
        'inboundQuantity', 16,
        'shortageQuantity', 20,
        'window', '今日 14:00 前必须齐套',
        'suggestion', '优先释放已到货 16 件并触发采购替代供应商承诺，剩余 20 件进入供应风险升级。',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    NOW()
),
(
    'evidence-shortage-risk-resolution-integration-current',
    'shortage-resolution-PO-SHORTAGE-INTEGRATION-001-MAT-SHORTAGE-INTEGRATION',
    'ShortageRiskResolution',
    'PO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION',
    jsonb_build_object(
        'materialCode', 'MAT-SHORTAGE-INTEGRATION',
        'materialName', '伺服驱动器',
        'affectedOrders', 'WO-SHORTAGE-INTEGRATION-001 / WO-SHORTAGE-INTEGRATION-002',
        'sourceOrderNumber', 'PO-SHORTAGE-INTEGRATION-001',
        'receivedQuantity', 20,
        'unit', 'pcs',
        'availableQuantity', 120,
        'resolvedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'message', 'PO-SHORTAGE-INTEGRATION-001 已补齐 20 pcs，缺料风险关闭，可释放 AI 排产复核。'
    )::text,
    NOW()
),
(
    'evidence-supply-risk-escalation-integration-current',
    'supply-risk-PO-SUPPLY-INTEGRATION-001-MAT-SUPPLY-INTEGRATION',
    'SupplyRiskEscalation',
    'PO-SUPPLY-INTEGRATION-001:MAT-SUPPLY-INTEGRATION',
    jsonb_build_object(
        'purchaseOrderNumber', 'PO-SUPPLY-INTEGRATION-001',
        'materialCode', 'MAT-SUPPLY-INTEGRATION',
        'materialName', '高精密轴承',
        'supplierName', '北方精密协作厂',
        'originalDeliveryDate', to_char((NOW() + INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'promisedDeliveryDate', to_char((NOW() + INTERVAL '4 days'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'delayDays', 3,
        'affectedOrders', 'WO-SUPPLY-INTEGRATION-001 / WO-SUPPLY-INTEGRATION-002',
        'alternateSupplierName', '华东快供二厂',
        'alternatePromiseDate', to_char((NOW() + INTERVAL '1 day'), 'YYYY-MM-DD'),
        'decision', 'alternate_committed',
        'statusLabel', '替代供应商承诺已锁定',
        'auditId', 'AUD-SUPPLY-RISK-INTEGRATION-CURRENT',
        'traceId', 'TRACE-SUPPLY-RISK-INTEGRATION-CURRENT',
        'message', '北方精密协作厂延期 3 天，华东快供二厂承诺 T+1 到货，受影响工单进入排产复核。',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'receivedAt', NULL,
        'receivedQuantity', NULL,
        'receiptAuditId', NULL,
        'receiptTraceId', NULL,
        'receiptMessage', NULL
    )::text,
    NOW()
),
(
    'evidence-supplier-network-decision-integration-current',
    'supplier-network-MAT-SUPPLY-INTEGRATION-华东快供二厂',
    'SupplierNetworkDecision',
    'MAT-SUPPLY-INTEGRATION:华东快供二厂',
    jsonb_build_object(
        'materialCode', 'MAT-SUPPLY-INTEGRATION',
        'materialName', '高精密轴承',
        'affectedOrders', 'WO-SUPPLY-INTEGRATION-001 / WO-SUPPLY-INTEGRATION-002',
        'selectedSupplierName', '华东快供二厂',
        'selectedPromiseDate', to_char((NOW() + INTERVAL '1 day'), 'YYYY-MM-DD'),
        'selectedPerformanceScore', 94.5,
        'selectedOnTimeRate', 98,
        'selectedQuotedPrice', 128,
        'selectedCapacityQuantity', 80,
        'candidates', jsonb_build_array(
            jsonb_build_object(
                'supplierName', '华东快供二厂',
                'promiseDate', to_char((NOW() + INTERVAL '1 day'), 'YYYY-MM-DD'),
                'quotedPrice', 128,
                'capacityQuantity', 80,
                'onTimeRate', 98,
                'defectRate', 0.4,
                'performanceScore', 94.5,
                'slaLeadTimeHours', 18,
                'slaStatus', 'preferred',
                'riskNote', '准交率高且具备当日锁产能力。'
            ),
            jsonb_build_object(
                'supplierName', '北方精密协作厂',
                'promiseDate', to_char((NOW() + INTERVAL '4 days'), 'YYYY-MM-DD'),
                'quotedPrice', 119,
                'capacityQuantity', 120,
                'onTimeRate', 82,
                'defectRate', 1.2,
                'performanceScore', 73,
                'slaLeadTimeHours', 72,
                'slaStatus', 'breached',
                'riskNote', '当前 PO 延期 3 天，保留观察。'
            )
        ),
        'statusLabel', '供应商恢复方案已推荐',
        'auditId', 'AUD-SUPPLIER-NETWORK-INTEGRATION-CURRENT',
        'traceId', 'TRACE-SUPPLIER-NETWORK-INTEGRATION-CURRENT',
        'message', '按 SLA、准交率、价格与产能评分，推荐华东快供二厂接管 MAT-SUPPLY-INTEGRATION 恢复供应。',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_evidence_links (
    id,
    agent_decision_id,
    evidence_type,
    evidence_key,
    evidence_summary,
    created_at
)
VALUES
(
    'evidence-quality-rework-impact-integration-current',
    'quality-rework-impact-integration-current',
    'QualityReworkImpact',
    'quality-rework-impact-integration-current',
    jsonb_build_object(
        'inspectionId', 'quality-rework-impact-integration-current',
        'workOrderId', 'WO-QUALITY-INTEGRATION-001',
        'productCode', 'PRD-QUALITY-INTEGRATION',
        'processName', '热处理',
        'equipmentCode', 'HT-01',
        'materialBatchCode', 'MAT-QUALITY-6061-B03',
        'batchCode', 'BATCH-QUALITY-REWORK-CURRENT',
        'inspectionPoint', '硬度复检',
        'defectQuantity', 2,
        'reworkHours', 6,
        'otdImpact', '当前质量返工影响 1 个交付窗口，需插入返工与复验时段。',
        'recommendedAction', '锁定热处理返工窗口，并将复验结果回写 OTD 证据链。',
        'rootCause', '热处理参数漂移导致硬度低于下限。',
        'evidence', jsonb_build_array('硬度检测记录 INS-QA-CURRENT', 'HT-01 炉温曲线', 'WO-QUALITY-INTEGRATION-001 排产窗口'),
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    NOW()
),
(
    'evidence-quality-mrb-disposition-integration-current',
    'quality-mrb-disposition-integration-current',
    'QualityMrbDisposition',
    'quality-mrb-disposition-integration-current',
    jsonb_build_object(
        'id', 'quality-mrb-disposition-integration-current',
        'title', '当前质量 MRB 处置与补料重排包',
        'inspectionId', 'quality-rework-impact-integration-current',
        'workOrderId', 'WO-QUALITY-INTEGRATION-001',
        'productCode', 'PRD-QUALITY-INTEGRATION',
        'processName', '装配',
        'equipmentCode', 'ASM-01',
        'materialBatchCode', 'MAT-QUALITY-STEEL-A12',
        'batchCode', 'BATCH-QUALITY-MRB-CURRENT',
        'inspectionPoint', '功能测试',
        'defectPattern', '装配间隙超差',
        'defectQuantity', 4,
        'disposition', 'scrap_rebuild',
        'dispositionLabel', '报废补料重建',
        'status', 'closed',
        'statusLabel', 'MRB 处置已闭环',
        'owner', '质量经理 / 生产经理',
        'dueAt', '今日 15:00',
        'otdImpact', '延期 +1 单风险，补料重排后预计追回。',
        'scheduleImpact', '冻结原装配窗口并重排补料后装配/复检。',
        'recommendedAction', '隔离不合格品，补料重建并回写复检证据。',
        'auditId', 'AUD-QUALITY-MRB-INTEGRATION-CURRENT',
        'traceId', 'TRACE-QUALITY-MRB-INTEGRATION-CURRENT',
        'scheduleTraceId', 'TRACE-QUALITY-MRB-SCHEDULE-INTEGRATION-CURRENT',
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'actions', jsonb_build_array(
            jsonb_build_object(
                'module', '质量闭环',
                'owner', '质量经理',
                'action', '隔离不合格批次并确认 MRB 判定。',
                'dueAt', '今日 11:30',
                'evidence', 'AUD-QUALITY-MRB-INTEGRATION-CURRENT',
                'result', 'closed'
            ),
            jsonb_build_object(
                'module', 'AI 排产',
                'owner', '调度主管',
                'action', '插入补料后装配与复检窗口。',
                'dueAt', '今日 15:00',
                'evidence', 'TRACE-QUALITY-MRB-SCHEDULE-INTEGRATION-CURRENT',
                'result', 'closed'
            )
        ),
        'closureAuditId', 'AUD-QUALITY-MRB-CLOSURE-INTEGRATION-CURRENT',
        'closureTraceId', 'TRACE-QUALITY-MRB-CLOSURE-INTEGRATION-CURRENT',
        'closureSummary', 'MRB 判定、补料重排、复检窗口均已写入统一证据链。',
        'closedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'closedBy', 'quality-manager'
    )::text,
    NOW()
),
(
    'evidence-quality-capa-closure-integration-current',
    'quality-capa-closure-integration-current',
    'QualityCapaClosure',
    'quality-capa-closure-integration-current',
    jsonb_build_object(
        'inspectionId', 'quality-capa-closure-integration-current',
        'workOrderId', 'WO-QUALITY-INTEGRATION-001',
        'traceId', 'TRACE-QUALITY-CAPA-INTEGRATION-CURRENT',
        'rootCause', '热处理参数漂移与首件复核间隔过长共同导致返工。',
        'evidenceStrength', 0.91,
        'taskTitle', '热处理参数漂移 CAPA 闭环复核',
        'taskKind', 'process-control',
        'owner', '质量经理 / 工艺工程师',
        'dueAt', '今日 16:00',
        'verification', '复验硬度合格，炉温曲线与首件复核记录已归档。',
        'verifiedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'auditState', 'closed',
        'otdImpact', '返工窗口已纳入排产，OTD 风险已从高降为中。',
        'reviewAction', '下次热处理批次开工前强制执行首件复核与参数双签。'
    )::text,
    NOW()
)
ON CONFLICT (id) DO NOTHING;
