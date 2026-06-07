# DEMO-OTD-30-202605 Data Dictionary

> 任务：T-16 30 单可重放基准数据集  
> 数据集 ID：`DEMO-OTD-30-202605`  
> 固定随机种子：`20260523`  
> SQL seed：`db/seed-demo-otd-30-202605.sql`

## 重放约束

- 同一代码、同一 seed、同一 `ScheduleRequest` 输入，OTD 结果必须一致。
- baseline 和 agent 必须从同一批 30 单、同一设备、同一 BOM/路线、同一物料状态构建。
- baseline runners 复用 `SchedulingRuleEngine`：FCFS、EDD、WeightedComposite、LeastLoaded。
- Agent runner 复用现有 `SchedulingAgent`：规则初排 + LLM 精调 + 约束验证。

## 字段定义

| 字段 | 必填 | 含义 |
|---|---|---|
| `dataset_id` | 是 | 固定 `DEMO-OTD-30-202605` |
| `seed` | 是 | 固定 `20260523` |
| `work_order_id` | 是 | `WO-DEMO-0001` 到 `WO-DEMO-0030` |
| `due_date` | 是 | 交期 |
| `priority` | 是 | 0-10，急单高 |
| `route_code` | 是 | `R-CNC-STD` / `R-ASM-STD` / `R-HEAT-QA` |
| `bom_code` | 是 | `BOM-A100` / `BOM-B200` / `BOM-C300` |
| `equipment_capability` | 是 | 设备类型、日产能、瓶颈标记 |
| `material_status` | 是 | `Ready` / `Shortage` / `EtaLocked` |
| `quality_risk` | 是 | `Low` / `Medium` / `High` |
| `is_rush_order` | 是 | 是否插单 |
| `is_locked_period` | 是 | 是否锁定期，不允许 Agent 调整 |
| `conflict_scenario` | 是 | 冲突场景 |
| `manual_baseline_expectation` | 是 | 人工基线预期 |
| `agent_improvement_reason` | 是 | Agent 改善原因 |

## 冲突场景

| 场景 | 工单 | 人工基线期望 | Agent 期望改善 |
|---|---|---|---|
| 正常生产 | 1-8 | EDD 基本准时 | WeightedComposite 降低换线 |
| 急单插入 | 9-14 | FCFS/EDD 会挤占原订单 | Agent 保护锁定期并重排非锁定窗口 |
| 设备故障 | 15-20 | LeastLoaded 能分散，但不理解瓶颈恢复窗口 | Agent 利用瓶颈预留产能与替代设备 |
| 缺料齐套 | 21-25 | 基线跳过缺料单或造成等待 | Agent 先排齐套单，缺料单绑定 ETA |
| 质量返工 | 26-30 | 基线只看交期，不保留复检窗口 | Agent 插入返工/复检并解释 OTD 影响 |

## 30 单明细

| 工单 | 交期 | 优先级 | 路线 | BOM | 设备能力 | 物料状态 | 质量风险 | 急单 | 锁定期 | 冲突场景 | 人工基线期望 | Agent 改善原因 |
|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| WO-DEMO-0001 | 2026-05-27 18:00 | 4 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 否 | 正常生产 | EDD 可准时 | 同族 A100 连续加工减少换线 |
| WO-DEMO-0002 | 2026-05-28 18:00 | 3 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 否 | 正常生产 | EDD 可准时 | 与 0001/0005 形成批次 |
| WO-DEMO-0003 | 2026-05-29 18:00 | 3 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Low | 否 | 否 | 正常生产 | 人工按交期排 | 插入装配空窗 |
| WO-DEMO-0004 | 2026-05-29 18:00 | 4 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | Medium | 否 | 否 | 正常生产 | 热处理接近瓶颈 | 保留复检缓冲 |
| WO-DEMO-0005 | 2026-05-30 18:00 | 5 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 否 | 正常生产 | EDD 可准时 | A100 批次减少 240min 换线 |
| WO-DEMO-0006 | 2026-05-30 18:00 | 2 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Low | 否 | 否 | 正常生产 | 低优先级可能后置 | 不影响高优先级时填补产能 |
| WO-DEMO-0007 | 2026-05-31 18:00 | 3 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | Medium | 否 | 否 | 正常生产 | 热处理排队 | 与 0004/0024 连续热处理 |
| WO-DEMO-0008 | 2026-05-31 18:00 | 4 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Low | 否 | 否 | 正常生产 | EDD 可准时 | 装配线均衡利用 |
| WO-RUSH-0009 | 2026-05-27 12:00 | 10 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Medium | 是 | 否 | 急单插入 | FCFS 会错过急单 | 插入非锁定 CNC 窗口 |
| WO-RUSH-0010 | 2026-05-28 12:00 | 9 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Medium | 是 | 否 | 急单插入 | EDD 会压缩锁定单 | 保留锁定期，装配线优先 |
| WO-DEMO-0011 | 2026-05-29 12:00 | 6 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 是 | 急单插入 | 人工可能移动锁定单 | Agent 禁止移动锁定期 |
| WO-DEMO-0012 | 2026-05-29 12:00 | 5 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | Medium | 否 | 是 | 急单插入 | 人工可能牺牲复检 | Agent 保留热处理锁定窗口 |
| WO-RUSH-0013 | 2026-05-30 12:00 | 9 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Medium | 是 | 否 | 急单插入 | EDD 后仍有换线损失 | A100 批次内插单 |
| WO-DEMO-0014 | 2026-06-01 18:00 | 4 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Low | 否 | 否 | 急单插入 | 被急单挤压 | Agent 用低风险订单让位 |
| WO-DEMO-0015 | 2026-06-01 18:00 | 7 | R-CNC-STD | BOM-A100 | CNC-01 故障，CNC-02 可替代 | Ready | Medium | 否 | 否 | 设备故障 | LeastLoaded 分散但不保瓶颈 | 转 CNC-02 并保护恢复窗口 |
| WO-DEMO-0016 | 2026-06-02 18:00 | 6 | R-CNC-STD | BOM-A100 | CNC-01 故障，CNC-02 可替代 | Ready | Low | 否 | 否 | 设备故障 | 人工延后 | 与 0015 合批降低换线 |
| WO-DEMO-0017 | 2026-06-02 18:00 | 7 | R-HEAT-QA | BOM-C300 | Heat 瓶颈 70 件日 | Ready | High | 否 | 否 | 设备故障 | 热处理拥塞 | 预留复检和瓶颈缓冲 |
| WO-DEMO-0018 | 2026-06-03 18:00 | 5 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Low | 否 | 否 | 设备故障 | 填补装配线 | Agent 作为替代窗口缓冲 |
| WO-DEMO-0019 | 2026-06-03 18:00 | 6 | R-CNC-STD | BOM-A100 | CNC-01 故障，CNC-02 可替代 | Ready | Medium | 否 | 否 | 设备故障 | 延期风险中等 | 拆单到替代设备 |
| WO-DEMO-0020 | 2026-06-04 18:00 | 5 | R-HEAT-QA | BOM-C300 | Heat 瓶颈 70 件日 | Ready | Medium | 否 | 否 | 设备故障 | 可后置 | 作为热处理恢复后填充 |
| WO-DEMO-0021 | 2026-06-03 12:00 | 8 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Shortage(sensor) | Medium | 否 | 否 | 缺料齐套 | 基线排入后等待 | 绑定传感器 ETA，先排齐套单 |
| WO-DEMO-0022 | 2026-06-04 12:00 | 7 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Shortage(sensor) | Medium | 否 | 否 | 缺料齐套 | 同批等待 | 与 0021 合并 ETA 后批量排 |
| WO-DEMO-0023 | 2026-06-04 18:00 | 5 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 否 | 缺料齐套 | 可正常排 | Agent 先排齐套 A100 保 OTD |
| WO-DEMO-0024 | 2026-06-05 18:00 | 6 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | Medium | 否 | 否 | 缺料齐套 | 热处理排队 | 与 C300 批次连续 |
| WO-DEMO-0025 | 2026-06-05 18:00 | 8 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | EtaLocked(shell) | Medium | 否 | 否 | 缺料齐套 | 基线误判可排 | Agent 等 ETA，避免无效占线 |
| WO-REWORK-0026 | 2026-06-03 18:00 | 9 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | High | 否 | 否 | 质量返工 | 基线不留复检 | 插入返工和复检窗口 |
| WO-REWORK-0027 | 2026-06-04 18:00 | 8 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | High | 否 | 否 | 质量返工 | 人工压缩检验 | 保留质量门 |
| WO-DEMO-0028 | 2026-06-06 18:00 | 5 | R-ASM-STD | BOM-B200 | Assembly 180 件日 | Ready | Medium | 否 | 否 | 质量返工 | 可被挤压 | 装配窗口让位返工 |
| WO-DEMO-0029 | 2026-06-07 18:00 | 6 | R-HEAT-QA | BOM-C300 | Heat 70 件日 | Ready | Medium | 否 | 否 | 质量返工 | 热处理可后置 | 与 0026 共享复检资源 |
| WO-DEMO-0030 | 2026-06-07 18:00 | 5 | R-CNC-STD | BOM-A100 | CNC 120/95 件日 | Ready | Low | 否 | 否 | 质量返工 | 低风险后置 | 批次尾单填补产能 |

## 验收

1. SQL seed 可重复执行，不重复插入。
2. 30 个工单全部包含交期、优先级、路线、BOM、设备能力、物料状态、质量风险、急单、锁定期。
3. A/B 对比里 baseline 和 agent 都从同一 `ScheduleRequest` 输入构建。
4. 固定 seed 重跑，OTD、LatePeriodHours、AverageLateness 一致。
