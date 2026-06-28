# 2026-06-12 Issue：真实 dhtmlx 拖拽 E2E 首跑 flaky

## 现象

- `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存" --reporter=line` 曾出现 retry 通过但首跑失败。
- 失败形态包括：
  - 默认 e2e 环境启用 demo hints，真实 dhtmlx `task_id="dhtmlx-item-rush"` 不存在。
  - 急单建议生成按钮点击后，`.adopt-suggestion` 未稳定出现。
  - 任务条可见但拖拽后 `rescheduleRequests.length` 仍为 0。

## 根因判断

- 真实 dhtmlx 证据依赖构建期 `VITE_SHOW_DEMO_HINTS=false`，但 e2e wrapper 默认开启 demo hints。
- 测试鼠标动作从任务条外层中心拖 80px，首跑偶发不足以让 dhtmlx 识别成有效拖拽。
- 建议生成/采纳路径缺少对“建议已进入 active suggestion”的显式等待。

## 修复

- `scripts/e2e.mjs`：grep 参数包含 `真实 dhtmlx` 时自动关闭 demo hints/offline demo。
- `scheduling.spec.ts`：
  - 用 `adoptRushSuggestion` 显式等待急单建议生成和采纳状态。
  - 用 `dragRushTask` 等 bbox 稳定，从 `.gantt_task_content` 拖 180px。

## 当前状态

- 已验证无 retry 通过真实 dhtmlx 拖拽保存成功/失败两条路径。
