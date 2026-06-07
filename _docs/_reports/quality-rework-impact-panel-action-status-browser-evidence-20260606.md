# QualityReworkImpactPanel 返工动作语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有质量返工用户关键路径。
- 本片覆盖返工排产事件生成动作和同步消息的可访问语义。
- 未改变返工事件写入、排产联动、OTD 报表或聊天回复业务逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/quality/QualityReworkImpactPanel.vue`
  - 生成按钮增加上下文可访问名称：`生成 WO-003 INS-003 返工排产事件`。
  - 返工同步消息增加 `role="status"` 和 `aria-live="polite"`。
- `src/frontend/tests/unit/quality-rework-impact-panel.test.ts`
  - 新增组件单测，覆盖生成按钮上下文名和同步消息 status 语义。
- `src/frontend/tests/e2e/quality.spec.ts`
  - 真实 Chromium 返工流程改用上下文按钮可访问名定位。
  - 同步消息改用 `getByRole('status')` 验证。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/quality-rework-impact-panel.test.ts`
  - 预期失败：按钮 `aria-label` 为 `undefined`，找不到 `[role="status"]`。
- GREEN：`npm.cmd run test:unit -- tests/unit/quality-rework-impact-panel.test.ts`
  - Vitest 1 file passed，2/2 tests passed。
- 真实浏览器：`npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量返工事件回写排产和 OTD 复盘"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
