# ScheduleBoard 批量方案反馈同步失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：调度员打开 `ScheduleBoard` 多目标对比后采用推荐方案，但后台采纳反馈同步失败。
- 目标：真实 Chromium 中必须保留本地目标切换，并把后台失败原因以可访问状态提示展示给调度员。

## 变更

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增真实 Chromium 用例：`批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因`。
  - 拦截 `/api/v1/scheduling/optimize-compare` 返回综合平衡方案。
  - 拦截 `/api/v1/scheduling/adoption-feedback` 返回 503，并用 `feedbackRequests` 断言请求真实命中。
  - 拦截 `/api/v1/scheduling/optimize` 返回已应用方案，验证本地目标切换仍保留。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "批量方案反馈同步失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 真实点击 `多目标对比`。
- 真实点击对比弹窗内 `采用此方案`。
- 反馈同步接口真实命中并返回 `chromium batch feedback unavailable`。
- 页面展示 `.sync-note[role="status"][aria-live="polite"]`。
- 状态提示包含：
  - `批量方案采纳反馈同步失败`
  - `当前仅保留本地目标切换`
  - `chromium batch feedback unavailable`
- 页面仍显示 `综合平衡方案` 与 `综合平衡方案已应用`。

## 选片说明

- 本轮未继续做拖拽保存失败 Chromium 证据，因为当前 e2e 构建强制 `VITE_SHOW_DEMO_HINTS=true`，`GanttChart` 走轻量甘特模式，没有真实拖拽事件源。
- 为避免伪造证据，改选真实按钮入口的批量方案反馈失败路径。

## 结论

- `ScheduleBoard` 批量方案反馈同步失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
