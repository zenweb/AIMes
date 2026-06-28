# 2026-06-11 Todo: Sprint 0 前端 e2e 证据链后续

## 已完成

- 审计回放页助手动作审计后端读取失败时回退本地记录。
- 实时监控页 POC Hypercare 后端读取失败时回退本地记录。
- 原 7 个失败用例真实浏览器回归：7 passed。
- 原 13 个聚焦用例真实浏览器回归：13 passed。
- 完整前端 e2e 真实浏览器回归：358 passed。
- 默认前端 unit 回归：89 files / 596 tests passed，无 unhandled errors。
- `npm run lint`：PASS。
- 覆盖率杠杆选片已补强 `AuditDecisionReplayPanel` 质量灰度扩大推荐范围分支：目标用例 1 passed，组件测试 20 passed。
- 覆盖率杠杆选片已补强 `AnomalyBoard` 质量异常分流 trace 分支：目标用例 1 passed，组件测试 7 passed。
- Docker 恢复后发布证据范围真实浏览器复跑：`login/audit/monitoring/quality` 生产构建 PASS，Chrome 78 passed。

## 下一步

- 继续推进 Sprint 0 基线里未关闭的后端、PostgreSQL/staging 和发布闸门证据。
- Docker Desktop/Linux Engine 已恢复后，优先验证 PostgreSQL/staging 依赖能否启动并支撑后端基线。
- 继续把 release gate B-track 单独 fail loud：Attack Chain A/B/C、security signoff、gray observation。
- 质量轨道 A 后续继续按覆盖率杠杆选片，优先选择低覆盖且用户必经组件；不要回到已高覆盖 LoginPage 微切片。
- 若继续质量轨道 A，优先从全量 coverage 的低覆盖用户关键组件中选下一片；不要重复补已经有充足动作失败/审计覆盖的 `ChatPanel` 分支。
