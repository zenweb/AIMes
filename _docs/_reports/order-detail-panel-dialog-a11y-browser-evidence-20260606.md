# OrderDetailPanel 工单详情抽屉语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖 AI 排产工作台的工单详情抽屉：打开详情、接口失败兜底和关闭动作必须有明确可访问语义。
- 未改动工单详情加载、排产解释兜底、甘特任务交互或后端接口逻辑。
- 未关闭发布 B 轨道闸门。

## 选片依据

- `npm.cmd run test:unit:coverage` 已刷新：86 files / 560 tests passed，总行覆盖率 `78.97%`。
- `OrderDetailPanel.vue` 行覆盖约 `70.27%`，分支/函数覆盖为 `0%`，且属于排产工作台用户必经的任务级解释/详情链路。
- 既有 e2e 已覆盖接口失败兜底，本片补齐组件自身 dialog/status/alert 语义，不重复造失败路径。

## 变更

- `src/frontend/src/components/schedule/OrderDetailPanel.vue`
  - 根抽屉增加 `role="dialog"`、`aria-modal` 和动态 `aria-label`。
  - 关闭按钮增加 `aria-label="关闭工单详情"`。
  - loading/empty 使用 `role="status"`、`aria-live="polite"`。
  - error 使用 `role="alert"`、`aria-live="assertive"`。
- `src/frontend/tests/unit/order-detail-panel.test.ts`
  - 新增专门单测，先验证原实现缺少 dialog/status/alert 语义而失败，再补实现转绿。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 在 `工单详情接口失败时真实浏览器展示本地排产解释兜底` 场景中验证真实 Chromium DOM 语义。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/order-detail-panel.test.ts`
  - 预期失败：根面板 `role` 为 `undefined`，loading 也无 `role="status"`。
- GREEN：`npm.cmd run test:unit -- tests/unit/order-detail-panel.test.ts`
  - Vitest 1 file passed，2/2 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "工单详情接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:unit:coverage`
  - 86 files passed，560 tests passed；用于本片选片依据。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
