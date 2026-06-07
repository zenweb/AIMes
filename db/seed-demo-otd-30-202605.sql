-- Dataset: DEMO-OTD-30-202605
-- Seed: 20260523
-- Purpose: deterministic 30-order benchmark for V1.5 OTD A/B comparison.
-- Re-runnable: deletes only rows whose IDs/codes use the DEMO-OTD-30-202605 namespace.

BEGIN TRANSACTION;

DELETE FROM work_orders WHERE id LIKE 'demo-otd-30-wo-%';
DELETE FROM equipment WHERE id LIKE 'demo-otd-30-eq-%';
DELETE FROM materials WHERE id LIKE 'demo-otd-30-mat-%';

INSERT INTO equipment
    (id, equipment_code, equipment_name, equipment_type, workshop_id, workshop_name, status, capacity, utilization_rate, current_work_order_id, created_at)
VALUES
    ('demo-otd-30-eq-cnc-01', 'DEMO-CNC-01', 'DEMO CNC 1号', 'CNC', 'ws-demo-otd-30', 'DEMO OTD 车间', 'Available', 120, 0, '', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-eq-cnc-02', 'DEMO-CNC-02', 'DEMO CNC 2号', 'CNC', 'ws-demo-otd-30', 'DEMO OTD 车间', 'Available', 95, 0, '', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-eq-asm-01', 'DEMO-ASM-01', 'DEMO 装配线 1号', 'Assembly', 'ws-demo-otd-30', 'DEMO OTD 车间', 'Available', 180, 0, '', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-eq-heat-01', 'DEMO-HEAT-01', 'DEMO 热处理炉 1号', 'HeatTreatment', 'ws-demo-otd-30', 'DEMO OTD 车间', 'Available', 70, 0, '', '2026-05-23T00:00:00Z');

INSERT INTO materials
    (id, material_code, material_name, material_type, unit, available_quantity, reserved_quantity, safety_stock, storage_location, created_at)
VALUES
    ('demo-otd-30-mat-al6061', 'DEMO-AL6061', 'DEMO 铝合金 6061', 'Raw', 'KG', 2600, 300, 100, 'D-A-01', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-mat-bearing', 'DEMO-BEARING', 'DEMO 精密轴承', 'Purchased', 'PCS', 1400, 200, 80, 'D-B-01', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-mat-shell', 'DEMO-SHELL', 'DEMO 壳体组件', 'SemiFinished', 'PCS', 520, 160, 50, 'D-C-01', '2026-05-23T00:00:00Z'),
    ('demo-otd-30-mat-sensor', 'DEMO-SENSOR', 'DEMO 传感器', 'Purchased', 'PCS', 180, 150, 40, 'D-D-01', '2026-05-23T00:00:00Z');

INSERT INTO work_orders
    (id, order_number, product_code, product_name, planned_quantity, completed_quantity, planned_start_date, planned_end_date, status, workshop_id, route_code, priority, created_at)
VALUES
    ('demo-otd-30-wo-0001', 'WO-DEMO-0001', 'A100', '精密转接座 A100', 120, 0, '2026-05-24T08:00:00Z', '2026-05-27T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 4, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0002', 'WO-DEMO-0002', 'A100', '精密转接座 A100', 90, 0, '2026-05-24T08:00:00Z', '2026-05-28T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 3, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0003', 'WO-DEMO-0003', 'B200', '控制壳体 B200', 80, 0, '2026-05-24T08:00:00Z', '2026-05-29T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 3, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0004', 'WO-DEMO-0004', 'C300', '热处理轴套 C300', 60, 0, '2026-05-24T08:00:00Z', '2026-05-29T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 4, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0005', 'WO-DEMO-0005', 'A100', '精密转接座 A100', 150, 0, '2026-05-25T08:00:00Z', '2026-05-30T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0006', 'WO-DEMO-0006', 'B200', '控制壳体 B200', 110, 0, '2026-05-25T08:00:00Z', '2026-05-30T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 2, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0007', 'WO-DEMO-0007', 'C300', '热处理轴套 C300', 75, 0, '2026-05-25T08:00:00Z', '2026-05-31T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 3, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0008', 'WO-DEMO-0008', 'B200', '控制壳体 B200', 130, 0, '2026-05-25T08:00:00Z', '2026-05-31T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 4, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0009', 'WO-RUSH-0009', 'A100', '急单转接座 A100', 70, 0, '2026-05-26T08:00:00Z', '2026-05-27T12:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 10, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0010', 'WO-RUSH-0010', 'B200', '急单壳体 B200', 65, 0, '2026-05-26T08:00:00Z', '2026-05-28T12:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 9, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0011', 'WO-DEMO-0011', 'A100', '锁定期转接座 A100', 110, 0, '2026-05-26T08:00:00Z', '2026-05-29T12:00:00Z', 'Scheduled', 'ws-demo-otd-30', 'R-CNC-STD', 6, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0012', 'WO-DEMO-0012', 'C300', '锁定期轴套 C300', 55, 0, '2026-05-26T08:00:00Z', '2026-05-29T12:00:00Z', 'Scheduled', 'ws-demo-otd-30', 'R-HEAT-QA', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0013', 'WO-RUSH-0013', 'A100', '急单转接座 A100', 95, 0, '2026-05-27T08:00:00Z', '2026-05-30T12:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 9, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0014', 'WO-DEMO-0014', 'B200', '控制壳体 B200', 150, 0, '2026-05-27T08:00:00Z', '2026-06-01T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 4, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0015', 'WO-DEMO-0015', 'A100', 'CNC 故障影响 A100', 140, 0, '2026-05-28T08:00:00Z', '2026-06-01T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 7, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0016', 'WO-DEMO-0016', 'A100', 'CNC 故障影响 A100', 100, 0, '2026-05-28T08:00:00Z', '2026-06-02T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 6, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0017', 'WO-DEMO-0017', 'C300', '热处理瓶颈 C300', 90, 0, '2026-05-28T08:00:00Z', '2026-06-02T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 7, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0018', 'WO-DEMO-0018', 'B200', '装配替代 B200', 160, 0, '2026-05-29T08:00:00Z', '2026-06-03T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0019', 'WO-DEMO-0019', 'A100', 'CNC 故障影响 A100', 125, 0, '2026-05-29T08:00:00Z', '2026-06-03T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 6, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0020', 'WO-DEMO-0020', 'C300', '热处理瓶颈 C300', 85, 0, '2026-05-29T08:00:00Z', '2026-06-04T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0021', 'WO-DEMO-0021', 'B200', '缺传感器 B200', 120, 0, '2026-05-30T08:00:00Z', '2026-06-03T12:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 8, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0022', 'WO-DEMO-0022', 'B200', '缺传感器 B200', 95, 0, '2026-05-30T08:00:00Z', '2026-06-04T12:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 7, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0023', 'WO-DEMO-0023', 'A100', '齐套转接座 A100', 135, 0, '2026-05-30T08:00:00Z', '2026-06-04T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0024', 'WO-DEMO-0024', 'C300', '齐套热处理 C300', 70, 0, '2026-05-31T08:00:00Z', '2026-06-05T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 6, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0025', 'WO-DEMO-0025', 'B200', '缺壳体 B200', 110, 0, '2026-05-31T08:00:00Z', '2026-06-05T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 8, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0026', 'WO-REWORK-0026', 'C300', '返工热处理 C300', 45, 0, '2026-06-01T08:00:00Z', '2026-06-03T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 9, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0027', 'WO-REWORK-0027', 'A100', '返工转接座 A100', 60, 0, '2026-06-01T08:00:00Z', '2026-06-04T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 8, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0028', 'WO-DEMO-0028', 'B200', '复检装配 B200', 100, 0, '2026-06-01T08:00:00Z', '2026-06-06T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-ASM-STD', 5, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0029', 'WO-DEMO-0029', 'C300', '复检热处理 C300', 80, 0, '2026-06-02T08:00:00Z', '2026-06-07T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-HEAT-QA', 6, '2026-05-23T00:00:00Z'),
    ('demo-otd-30-wo-0030', 'WO-DEMO-0030', 'A100', '复检转接座 A100', 115, 0, '2026-06-02T08:00:00Z', '2026-06-07T18:00:00Z', 'Created', 'ws-demo-otd-30', 'R-CNC-STD', 5, '2026-05-23T00:00:00Z');

COMMIT;
