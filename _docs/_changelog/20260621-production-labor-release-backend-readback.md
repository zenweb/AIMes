# 2026-06-21 生产开工读回人员放行证据

## 变更
- 生产报工页面启动时新增后端人员证据读回：
  - `GET /api/v1/scheduling/labor-reassignments?take=12`
  - `GET /api/v1/scheduling/labor-qualification-blocks?take=12`
- 开工校验从“只读 localStorage”升级为“本地即时记录 + 后端读回记录”。
- `released` 的人员资质阻断不会继续冻结热处理开工。
- `approved` 的替班放行记录可在刷新/新会话后继续解除热处理开工阻断。

## 验证
- `npm run test:unit -- tests/unit/production-board.test.ts`
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts`
- `npm run build`
- 真实浏览器验证：
  - 新会话登录后直接进入 `http://127.0.0.1:4173/scheduling/production?scanCode=WO-013`
  - 页面请求人员阻断与替班后端接口均为 200。
  - 页面显示 `人员: EMP-006 替班已确认`，不显示 `人员: EMP-003 停工复核`。
  - 开工弹窗显示替班已确认，确认按钮未禁用。
  - 截图：`src/frontend/output/playwright/production-labor-release-backend-readback.png`

## Fail Loud
- 当前真实后端 `POST /api/v1/production/scan` 对 `WO-013` 返回 400：`Operation or work order was not found.`
- 本次浏览器验证依赖生产页已有的 `WO-013` 前端演示工序 fallback 来打开开工校验；人员证据读回已验证，但生产扫描后端种子仍需单独补齐。
