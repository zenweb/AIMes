# 2026-06-20 人员停工复核单次 reviewing Upsert

## 变更
- 修复人员管理中“主管确认停工复核”会先写入 `active` 阻断、再写入 `reviewing` 复核的重复写入问题。
- 前端复核按钮现在只写入最终 `reviewing` 状态，不再额外持久化中间 `active` 记录。
- 后端 `AgentEvidenceLink` upsert 在发现同一 `EvidenceType + EvidenceKey` 已有重复记录时，会保留最新记录并删除旧重复。

## 验证
- 前端单测：`npm run test:unit -- tests/unit/skill-matrix-panel.test.ts tests/unit/employee-board.test.ts tests/unit/labor-assignment-sync.test.ts`
- 后端集成测试：`dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.ExecutionEvidenceApi_ShouldUpsertQueryAndAuditLaborBarcodeAndCapa"`
- 后端 API 收敛验证：旧数据库中 2 条 `LaborQualificationBlock` 被 upsert 收敛为 1 条 `reviewing`。
- 真实浏览器验证：
  - 入口：`http://127.0.0.1:4173/scheduling/employee`
  - 登录：`admin / admin123`
  - 点击“主管确认停工复核”后只发出 1 个 `POST /api/v1/scheduling/labor-qualification-blocks`。
  - POST payload 为 `status=reviewing`，页面无 Offline demo、员工列表加载失败、请求错误文案。
  - 截图：`src/frontend/output/playwright/labor-qualification-review-single-upsert.png`

## 数据库结果
- 重复组查询返回 0 行。
- `labor-qualification-block-WO-013-heat-treatment` 当前仅 1 条，状态为 `reviewing`。
