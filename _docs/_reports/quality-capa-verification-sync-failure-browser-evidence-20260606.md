# QualityCapaTaskPanel CAPA 验证同步失败真实浏览器证据

日期：2026-06-06

## 目标

补齐基础 CAPA 验证动作的真实 Chromium 失败态证据：点击执行中的 CAPA 任务 `推进处置` 时，如果 `aimes_quality_capa_closure` 写入失败，页面必须 fail-loud，并且不能伪造已验证状态、CAPA trace 或 OTD 证据。

## 选片依据

- 这是 `QualityCapaTaskPanel` 的基础质量闭环动作，直接决定质量验证是否进入审计回放与 OTD 复盘。
- 若失败时伪造 `已验证`，会把未持久化的质量结论传播到审计和报表。
- 本片延续 A 轨精品化策略：硬化已有用户关键路径，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`CAPA 验证同步失败时真实浏览器展示 fail-loud 且不伪造验证留痕`。
  - 使用初始状态为 `执行中` 的 `新增热处理硬度 SPC 预警点` CAPA 任务。
  - 让 `Storage.prototype.setItem` 对 `aimes_quality_capa_closure` 抛错，模拟 CAPA 验证回写失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "CAPA 验证同步失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `新增热处理硬度 SPC 预警点` 且状态为 `执行中`。
- 点击 `推进处置` 后显示 `role="alert"`。
- alert 包含 `CAPA 验证同步失败` 和 `CAPA closure storage unavailable from chromium`。
- 任务仍保持 `执行中`。
- `推进处置` 按钮仍可见，可重试。
- 不显示 `已验证` 按钮。
- 不显示 `已完成验证：SPC 连续 6 点无上升风险`。
- 不显示 `已同步到审计回放与 OTD 复盘`。
- 不显示 `TRACE-QA-CAPA-20260520-CAPA-SPC-MONITOR`。
- `localStorage.aimes_quality_capa_closure` 仍为 `null`。
- `aimes_otd_evidence_chain` 不包含该 CAPA trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
