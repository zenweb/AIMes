# 2026-06-11 Issue: 前端 e2e 证据链被后端优先读取吞掉

## 症状

- ChatPanel 生成异常处置卡、交期恢复包、工程约束包、客户承诺包、BOM 齐套包、设备停机包后，业务页面可见，但审计回放页找不到对应助手动作卡。
- Report 生成 POC Hypercare 包后，报表/首页可见，但实时监控页找不到 `上线后稳定运行监控`。
- 完整 e2e 复跑时，`quality.spec.ts` 仍按旧按钮名 `生成 WO-003 INS-003 返工排产事件` 定位，和组件稳定可访问名不一致。
- 默认 `npm run test:unit` 随后暴露 2 个测试断裂与 2 个 unhandled errors：unit mock 未导出新增本地 fallback API，质量返工按钮断言仍使用旧动态名称。

## 根因

这些页面使用 backend-first 读取，并开启 fail-loud；当后端读取失败时只记录告警，没有回退到刚写入的本地离线证据，导致跨页面证据链断裂。

## 修复

- `AuditDecisionReplayPanel.vue`：助手动作审计 catch 分支保留错误告警，同时回退 `readAssistantActionAudits()`。
- `MonitoringBoard.vue`：Hypercare 初始化 catch 分支保留错误告警，同时回退 `readPocHypercareAcceptanceRecord()`。
- `quality.spec.ts`：按钮定位改为稳定名称 `生成返工排产事件`。
- `monitoring-board.test.ts`、`audit-decision-replay-panel.test.ts`：mock 补齐新增本地 fallback 读取导出。
- `quality-rework-impact-panel.test.ts`：断言对齐稳定可访问名称 `生成返工排产事件：WO-003 INS-003`。

## 当前状态

- 原 7 个失败用例已通过真实浏览器验证。
- 原 13 个聚焦用例已通过真实浏览器验证。
- 完整前端 e2e 套件已通过真实浏览器验证：358 passed。
- 默认前端 unit 已通过：89 files / 596 tests passed，无 unhandled errors。
- `AuditDecisionReplayPanel` 覆盖率杠杆切片已补强：质量灰度“审批通过后扩大推荐范围”回放分支新增测试，组件测试 20 passed。
- `AnomalyBoard` 覆盖率杠杆切片已补强：现场事件中心“质量异常确认分流并展示下游 trace”分支新增测试，组件测试 7 passed。
- Docker Desktop/Linux Engine 恢复后，发布证据范围真实浏览器复跑仍通过：生产构建 PASS，Chrome 78 passed。

## 后续风险

- 覆盖率补强不能关闭发布级人工闸门；Attack Chain A/B/C、security signoff、gray observation 仍需独立证据。
- `ChatPanel` 已有大量动作包、权限拒绝、审计失败、导航失败和下载失败测试；后续不应为了提高计数重复覆盖同类分支。
