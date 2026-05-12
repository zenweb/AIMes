-- ============================================================
-- MES 系统演示种子数据
-- 适用于 PostgreSQL，用于开发和演示环境初始化
-- 用法: psql -d mes -f database/seed.sql
-- ============================================================

BEGIN;

TRUNCATE TABLE
    ai_decision_traces,
    anomaly_responses,
    audit_logs,
    bom_change_records,
    bom_item_children,
    bom_items,
    chat_messages,
    defect_records,
    document_chunks,
    equipment_telemetry,
    maintenance_records,
    operation_executions,
    operation_report_materials,
    operation_reports,
    production_anomalies,
    quality_inspections,
    routing_step_parameters,
    routing_steps,
    schedule_items,
    schedule_plans,
    work_orders,
    materials,
    equipment,
    bills_of_material,
    process_routes
RESTART IDENTITY CASCADE;

-- ============================================================
-- 设备
-- ============================================================
INSERT INTO equipment (id, equipment_code, equipment_name, equipment_type, workshop_id, workshop_name, status, capacity, utilization_rate, current_work_order_id, "Parameters", created_at) VALUES
('eq-001', 'CNC-001', 'CNC加工中心1号', 'CNC', 'ws-001', '精密加工车间', 'Running', 100, 0.75, '', '', NOW()),
('eq-002', 'CNC-002', 'CNC加工中心2号', 'CNC', 'ws-001', '精密加工车间', 'Running', 100, 0.60, '', '', NOW()),
('eq-003', 'CNC-003', 'CNC加工中心3号', 'CNC', 'ws-001', '精密加工车间', 'Available', 100, 0, '', '', NOW()),
('eq-004', 'INJ-001', '注塑机1号', 'InjectionMolding', 'ws-002', '注塑车间', 'Running', 200, 0.80, '', '', NOW()),
('eq-005', 'INJ-002', '注塑机2号', 'InjectionMolding', 'ws-002', '注塑车间', 'Maintenance', 200, 0, '', '', NOW()),
('eq-006', 'ASM-001', '装配线1号', 'Assembly', 'ws-003', '总装车间', 'Running', 150, 0.65, '', '', NOW()),
('eq-007', 'ASM-002', '装配线2号', 'Assembly', 'ws-003', '总装车间', 'Available', 150, 0, '', '', NOW()),
('eq-008', 'HT-001', '热处理炉1号', 'HeatTreatment', 'ws-001', '精密加工车间', 'Idle', 80, 0.30, '', '', NOW());

-- ============================================================
-- 物料
-- ============================================================
INSERT INTO materials (id, material_code, material_name, material_type, unit, available_quantity, reserved_quantity, safety_stock, storage_location, created_at, updated_at) VALUES
('mat-001', 'AL-6061', '铝合金6061', '原材料', 'KG', 5000, 500, 200, 'A-01-01', NOW(), NOW()),
('mat-002', 'AL-7075', '铝合金7075', '原材料', 'KG', 2000, 200, 100, 'A-01-02', NOW(), NOW()),
('mat-003', 'ST-45', '45号钢', '原材料', 'KG', 8000, 1000, 500, 'A-02-01', NOW(), NOW()),
('mat-004', 'ST-SS304', '不锈钢304', '原材料', 'KG', 3000, 300, 150, 'A-02-02', NOW(), NOW()),
('mat-005', 'PP-GF30', '玻纤增强PP', '原材料', 'KG', 2000, 100, 100, 'B-01-01', NOW(), NOW()),
('mat-006', 'ABS-HG', '高抗冲ABS', '原材料', 'KG', 1500, 200, 80, 'B-01-02', NOW(), NOW()),
('mat-007', 'SCR-M8', 'M8螺丝', '标准件', 'PCS', 50000, 5000, 2000, 'C-01-01', NOW(), NOW()),
('mat-008', 'SCR-M10', 'M10螺丝', '标准件', 'PCS', 30000, 3000, 1000, 'C-01-02', NOW(), NOW()),
('mat-009', 'BRG-6205', '6205轴承', '标准件', 'PCS', 2000, 200, 100, 'C-02-01', NOW(), NOW()),
('mat-010', 'OIL-HM46', '抗磨液压油', '辅料', 'L', 500, 50, 20, 'D-01-01', NOW(), NOW()),
('mat-011', 'PKG-BOX', '包装箱', '包材', 'PCS', 10000, 1000, 500, 'E-01-01', NOW(), NOW()),
('mat-012', 'LABEL-WARN', '警示标签', '包材', 'PCS', 20000, 2000, 1000, 'E-01-02', NOW(), NOW());

-- ============================================================
-- BOM
-- ============================================================
INSERT INTO bills_of_material (id, bom_code, bom_name, product_code, product_name, bom_type, bom_version_status, effective_date, created_at, updated_at, version) VALUES
('bom-001', 'BOM-PRODA-V1', '精密转接座BOM', 'PROD-A', '精密转接座', 'Manufacturing', 'Released', '2025-01-01', NOW(), NOW(), 1),
('bom-002', 'BOM-PRODB-V1', '液压阀体BOM', 'PROD-B', '液压阀体', 'Manufacturing', 'Released', '2025-01-01', NOW(), NOW(), 1),
('bom-003', 'BOM-PRODC-V1', '仪表外壳BOM', 'PROD-C', '仪表外壳', 'Manufacturing', 'Released', '2025-01-01', NOW(), NOW(), 1);

INSERT INTO bom_items (id, bom_id, material_code, material_name, quantity, unit, loss_rate, sequence) VALUES
('bom-item-001', 'bom-001', 'AL-6061', '铝合金6061', 2.5, 'KG', 0.05, 10),
('bom-item-002', 'bom-001', 'SCR-M8', 'M8螺丝', 8, 'PCS', 0.01, 20),
('bom-item-003', 'bom-001', 'BRG-6205', '6205轴承', 2, 'PCS', 0, 30),
('bom-item-004', 'bom-001', 'PKG-BOX', '包装箱', 1, 'PCS', 0, 40),
('bom-item-005', 'bom-001', 'LABEL-WARN', '警示标签', 1, 'PCS', 0.02, 50),
('bom-item-006', 'bom-002', 'ST-45', '45号钢', 5.0, 'KG', 0.08, 10),
('bom-item-007', 'bom-002', 'SCR-M10', 'M10螺丝', 12, 'PCS', 0.01, 20),
('bom-item-008', 'bom-002', 'OIL-HM46', '抗磨液压油', 0.5, 'L', 0.03, 30),
('bom-item-009', 'bom-003', 'ABS-HG', '高抗冲ABS', 0.8, 'KG', 0.03, 10),
('bom-item-010', 'bom-003', 'SCR-M8', 'M8螺丝', 4, 'PCS', 0.01, 20);

-- ============================================================
-- 工艺路线
-- ============================================================
INSERT INTO process_routes (id, route_code, route_name, product_code, product_name, status, total_lead_time_minutes, created_at, updated_at, version) VALUES
('route-001', 'R-PRODA-V1', '精密转接座加工工艺', 'PROD-A', '精密转接座', 'Released', 480, NOW(), NOW(), 1),
('route-002', 'R-PRODB-V1', '液压阀体加工工艺', 'PROD-B', '液压阀体', 'Released', 600, NOW(), NOW(), 1),
('route-003', 'R-PRODC-V1', '仪表外壳注塑工艺', 'PROD-C', '仪表外壳', 'Released', 300, NOW(), NOW(), 1);

INSERT INTO routing_steps (id, route_id, step_sequence, operation_code, operation_name, workstation_type, standard_setup_minutes, standard_run_minutes_per_unit, equipment_type, inspection_required) VALUES
-- 精密转接座
('step-001', 'route-001', 10, 'OP-010', 'CNC粗加工', 'CNC工作站', 30, 15, 'CNC', true),
('step-002', 'route-001', 20, 'OP-020', 'CNC精加工', 'CNC工作站', 45, 20, 'CNC', true),
('step-003', 'route-001', 30, 'OP-030', '去毛刺', '钳工台', 15, 5, 'Assembly', true),
('step-004', 'route-001', 40, 'OP-040', '清洗', '清洗线', 10, 3, 'Assembly', false),
('step-005', 'route-001', 50, 'OP-050', '装配', '装配线', 20, 8, 'Assembly', true),
('step-006', 'route-001', 60, 'OP-060', '检验包装', '包装线', 10, 2, 'Assembly', true),
-- 液压阀体
('step-007', 'route-002', 10, 'OP-010', '下料', '锯床', 20, 5, 'CNC', false),
('step-008', 'route-002', 20, 'OP-020', '粗车', '车床', 40, 20, 'CNC', true),
('step-009', 'route-002', 30, 'OP-030', '精车', '车床', 50, 25, 'CNC', true),
('step-010', 'route-002', 40, 'OP-040', '钻孔攻丝', '加工中心', 30, 15, 'CNC', true),
('step-011', 'route-002', 50, 'OP-050', '去毛刺清洗', '清洗线', 20, 8, 'Assembly', false),
('step-012', 'route-002', 60, 'OP-060', '压力测试', '测试台', 30, 10, 'Assembly', true),
-- 仪表外壳
('step-013', 'route-003', 10, 'OP-010', '注塑成型', '注塑机', 60, 3, 'InjectionMolding', true),
('step-014', 'route-003', 20, 'OP-020', '去浇口', '钳工台', 10, 2, 'Assembly', true),
('step-015', 'route-003', 30, 'OP-030', '丝印', '印刷线', 20, 4, 'Assembly', true),
('step-016', 'route-003', 40, 'OP-040', '检验包装', '包装线', 10, 1, 'Assembly', true);

-- ============================================================
-- 工单
-- ============================================================
INSERT INTO work_orders (id, order_number, product_code, product_name, planned_quantity, completed_quantity, planned_start_date, planned_end_date, status, workshop_id, route_code, priority, created_at, updated_at) VALUES
('wo-001', 'WO-2026-001', 'PROD-A', '精密转接座', 200, 0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 'pending', 'ws-001', 'R-PRODA-V1', 80, NOW(), NOW()),
('wo-002', 'WO-2026-002', 'PROD-A', '精密转接座', 150, 50, NOW() - INTERVAL '2 days', NOW() + INTERVAL '4 days', 'in_progress', 'ws-001', 'R-PRODA-V1', 90, NOW(), NOW()),
('wo-003', 'WO-2026-003', 'PROD-B', '液压阀体', 100, 0, NOW(), NOW() + INTERVAL '5 days', 'pending', 'ws-001', 'R-PRODB-V1', 75, NOW(), NOW()),
('wo-004', 'WO-2026-004', 'PROD-B', '液压阀体', 80, 30, NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', 'in_progress', 'ws-001', 'R-PRODB-V1', 85, NOW(), NOW()),
('wo-005', 'WO-2026-005', 'PROD-C', '仪表外壳', 1000, 0, NOW(), NOW() + INTERVAL '3 days', 'pending', 'ws-002', 'R-PRODC-V1', 70, NOW(), NOW()),
('wo-006', 'WO-2026-006', 'PROD-C', '仪表外壳', 500, 200, NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'in_progress', 'ws-002', 'R-PRODC-V1', 80, NOW(), NOW()),
('wo-007', 'WO-2026-007', 'PROD-A', '精密转接座', 300, 0, NOW() + INTERVAL '2 days', NOW() + INTERVAL '9 days', 'pending', 'ws-001', 'R-PRODA-V1', 60, NOW(), NOW()),
('wo-008', 'WO-2026-008', 'PROD-B', '液压阀体', 50, 0, NOW() + INTERVAL '1 day', NOW() + INTERVAL '4 days', 'pending', 'ws-001', 'R-PRODB-V1', 95, NOW(), NOW()),
('wo-009', 'WO-2026-009', 'PROD-C', '仪表外壳', 2000, 0, NOW() + INTERVAL '3 days', NOW() + INTERVAL '8 days', 'pending', 'ws-002', 'R-PRODC-V1', 65, NOW(), NOW()),
('wo-010', 'WO-2026-010', 'PROD-A', '精密转接座', 100, 0, NOW() + INTERVAL '5 days', NOW() + INTERVAL '8 days', 'pending', 'ws-001', 'R-PRODA-V1', 50, NOW(), NOW());

-- ============================================================
-- 排产计划
-- ============================================================
INSERT INTO schedule_plans (id, plan_name, plan_start_date, plan_end_date, overall_utilization_rate, on_time_delivery_rate, optimization_notes, created_at) VALUES
('plan-001', '2026年5月第2周排产计划', NOW(), NOW() + INTERVAL '7 days', 0.72, 0.88, '初始排产方案 — EDD优先规则', NOW());

INSERT INTO schedule_items (id, "SchedulePlanId", work_order_id, equipment_id, planned_start_time, planned_end_time, sequence, setup_time, "DependentItems") VALUES
('si-001', 'plan-001', 'wo-001', 'eq-001', NOW(), NOW() + INTERVAL '8 hours', 1, '30 分钟', '{}'),
('si-002', 'plan-001', 'wo-002', 'eq-001', NOW() + INTERVAL '8 hours' + INTERVAL '30 minutes', NOW() + INTERVAL '16 hours', 2, '45 分钟', '{si-001}'),
('si-003', 'plan-001', 'wo-003', 'eq-002', NOW(), NOW() + INTERVAL '10 hours', 1, '30 分钟', '{}'),
('si-004', 'plan-001', 'wo-004', 'eq-002', NOW() + INTERVAL '10 hours' + INTERVAL '30 minutes', NOW() + INTERVAL '18 hours', 2, '60 分钟', '{si-003}'),
('si-005', 'plan-001', 'wo-005', 'eq-004', NOW(), NOW() + INTERVAL '6 hours', 1, '60 分钟', '{}'),
('si-006', 'plan-001', 'wo-006', 'eq-004', NOW() + INTERVAL '6 hours' + INTERVAL '30 minutes', NOW() + INTERVAL '12 hours', 2, '30 分钟', '{si-005}'),
('si-007', 'plan-001', 'wo-007', 'eq-003', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '12 hours', 1, '30 分钟', '{}'),
('si-008', 'plan-001', 'wo-008', 'eq-003', NOW() + INTERVAL '2 days' + INTERVAL '12 hours' + INTERVAL '30 minutes', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', 2, '30 分钟', '{si-007}');

-- ============================================================
-- 质量检验记录
-- ============================================================
INSERT INTO quality_inspections (id, work_order_id, product_code, process_name, inspection_point, inspection_quantity, qualified_quantity, defect_quantity, result, inspector_id, inspected_at) VALUES
('qi-001', 'wo-002', 'PROD-A', 'CNC精加工', '加工后首检', 5, 5, 0, 'Passed', 'OP-001', NOW() - INTERVAL '1 day'),
('qi-002', 'wo-002', 'PROD-A', 'CNC精加工', '巡检', 10, 9, 1, 'ConditionalPass', 'OP-001', NOW() - INTERVAL '12 hours'),
('qi-003', 'wo-004', 'PROD-B', '精车', '加工后首检', 3, 3, 0, 'Passed', 'OP-002', NOW() - INTERVAL '1 day'),
('qi-004', 'wo-006', 'PROD-C', '注塑成型', '首件检验', 5, 5, 0, 'Passed', 'OP-003', NOW() - INTERVAL '1 day'),
('qi-005', 'wo-006', 'PROD-C', '注塑成型', '巡检', 10, 8, 2, 'ConditionalPass', 'OP-003', NOW() - INTERVAL '6 hours');

INSERT INTO defect_records ("QualityInspectionId", "DefectType", "Quantity", "Severity", "CorrectiveAction", "AreaRatio") VALUES
('qi-002', '尺寸超差', 1, 'Minor', '调整刀具补偿后继续加工', 0.02);

-- ============================================================
-- 设备遥测
-- ============================================================
INSERT INTO equipment_telemetry (id, equipment_id, timestamp, error_code, error_message) VALUES
('tel-001', 'eq-001', NOW() - INTERVAL '1 hour', '', ''),
('tel-002', 'eq-002', NOW() - INTERVAL '30 minutes', 'WARN-001', '主轴温度偏高（45°C）'),
('tel-003', 'eq-004', NOW() - INTERVAL '15 minutes', '', ''),
('tel-004', 'eq-005', NOW() - INTERVAL '1 day', 'ERR-002', '液压系统压力异常，已停机维修');

-- ============================================================
-- 生产异常
-- ============================================================
INSERT INTO production_anomalies (id, work_order_number, operation_code, equipment_id, anomaly_type, severity, title, description, detected_at, status, created_at, version) VALUES
('anom-001', 'WO-2026-002', 'OP-020', 'eq-001', '质量异常', 'Medium', '尺寸超差预警', '巡检发现外径尺寸偏大0.02mm，需调整刀具补偿', NOW() - INTERVAL '12 hours', 'Resolved', NOW(), 1),
('anom-002', 'WO-2026-006', 'OP-010', 'eq-004', '设备异常', 'High', '注塑机温度波动', '注塑机加热区温度波动超过±5°C，需检查加热圈', NOW() - INTERVAL '6 hours', 'Pending', NOW(), 1);

-- ============================================================
-- 维护记录
-- ============================================================
INSERT INTO maintenance_records (id, equipment_id, maintenance_type, description, start_time, end_time, performed_by, result, "SparePartsUsed", cost, created_at) VALUES
('mt-001', 'eq-005', '维修', '液压系统维修 — 更换密封圈', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 'MT-001', '已完成，设备恢复正常', '{}', 0, NOW()),
('mt-002', 'eq-001', '保养', '月度保养 — 更换切削液、清洁滤网', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 'MT-001', '已完成', '{}', 0, NOW());

COMMIT;
