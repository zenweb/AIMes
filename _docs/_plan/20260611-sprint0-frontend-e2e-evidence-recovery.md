# 2026-06-11 Plan: Sprint 0 前端 e2e 证据链收敛

## 目标

把 Sprint 0 基线中的前端 e2e 红灯按真实浏览器证据收敛，优先修复用户关键路径的跨模块审计可见性。

## 当前切片

- 聚焦原 13 个失败簇中的 ChatPanel、AuditDecisionReplayPanel、MonitoringBoard、ReportBoard 证据链。
- 不扩展新功能，只修复现有功能“生成后跨模块可审计”的可靠性。
- 追加覆盖率杠杆切片：优先补 `AuditDecisionReplayPanel` 中低覆盖但用户关键的质量灰度扩大推荐范围回放分支。
- 追加覆盖率杠杆切片：补 `AnomalyBoard` 中低覆盖但用户关键的质量异常分流 trace 分支。

## 验证顺序

1. 原 7 个红灯 targeted grep：已通过。
2. 原 13 个聚焦用例：已通过。
3. 完整前端 e2e：已通过，358 passed。
4. 默认前端 unit：已通过，89 files / 596 tests passed，无 unhandled errors。
5. 前端 lint：已通过。
6. `AuditDecisionReplayPanel` 目标用例：已通过，1 passed。
7. `AuditDecisionReplayPanel` 组件单测：已通过，20 passed。
8. `AuditDecisionReplayPanel` 单文件 coverage：已刷新，分支覆盖率 20.49%。
9. 全量前端 unit coverage：已通过，89 files / 597 tests passed，用于刷新选片基线。
10. `AnomalyBoard` 目标用例：已通过，1 passed。
11. `AnomalyBoard` 组件单测：已通过，7 passed。
12. `AnomalyBoard` 单文件 coverage：已刷新，行覆盖率 75.83%。
13. Docker 恢复后发布证据范围真实浏览器复跑：已通过，生产构建 PASS，Chrome 78 passed。

## Stop Condition

- 本切片停止条件已达成：完整前端 e2e 在真实浏览器中无失败。
- 附加 stop condition 已达成：默认前端 unit 脚本无失败且无 unhandled errors。
- 覆盖率杠杆切片 stop condition 已达成：低覆盖用户关键组件新增分支测试并通过组件级验证。
- Docker-restored 真实浏览器复核 stop condition 已达成：同一发布证据范围在生产预览 + Chrome 下 78/78 passed。
- 发布总目标不能因此标记完成；人工攻击链、安全签字和灰度观察仍是独立发布闸门。
