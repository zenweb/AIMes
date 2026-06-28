# 2026-06-21 排产页读回人员替班放行证据

## 变更
- 排产页启动时新增人员约束后端读回。
- 后端成功返回人员证据时，以后端为准：
  - `released` 的人员资质阻断不会生成停工复核事件。
  - `approved` 的人员替班记录会生成已闭环人员替班事件。
- 避免刷新或新会话后继续读取本地 stale `active` 阻断，导致 AI 排产页误报“停工复核建议”。

## 验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run build`
- 真实浏览器验证：
  - 新会话登录后进入 `http://127.0.0.1:4173/scheduling/scheduling`
  - `GET /api/v1/scheduling/labor-reassignments?take=12` 返回 200。
  - `GET /api/v1/scheduling/labor-qualification-blocks?take=12` 返回 200。
  - 页面显示人员替班已确认事件。
  - 页面不显示 `WO-013 热处理无有效替班候选` 或 `人员资质停工复核建议`。
  - 截图：`src/frontend/output/playwright/schedule-labor-release-backend-readback.png`

## 数据库前提
- `LaborQualificationBlock=labor-qualification-block-WO-013-heat-treatment` 状态为 `released`。
- `LaborReassignment=labor-reassignment-release-WO-013-heat-treatment` 状态为 `approved`。
