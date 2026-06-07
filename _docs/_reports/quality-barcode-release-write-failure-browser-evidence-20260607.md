# QualityBoard 扫码质量门释放写入失败真实浏览器证据

日期：2026-06-07

## 目标

补齐扫码返工复验放行的真实 Chromium 失败态证据：点击 `复验通过并释放交接` 时，如果 `aimes_otd_evidence_chain` 写入失败，页面必须 fail-loud，并且不能伪造放行状态、成功消息或释放 trace。

## 选片依据

- 扫码质量门释放会影响 OP-20 接收、排产窗口恢复和流转卡标签解冻，是质量闭环里的用户关键收口动作。
- 若失败时伪造放行，会让下游审计回放和 OTD 复盘误判质量冻结已解除。
- 本片延续 A 轨精品化策略：硬化已有 QualityBoard 关键路径，不扩新功能。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`扫码质量门释放写入失败时真实浏览器展示 fail-loud 且不伪造放行证据`。
  - 预置扫码返工、交接冻结、CAPA、标签冻结 4 条 active OTD 证据。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_otd_evidence_chain` 抛错，模拟复验放行证据归档失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码质量门释放写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `返工复验待放行`。
- 页面展示 `复验通过并释放交接` 按钮。
- 点击后显示 `role="alert"`。
- alert 包含 `扫码质量门释放写入失败` 和 `barcode release storage unavailable from chromium`。
- 失败后仍显示 `返工复验待放行`，按钮仍可见，可重试。
- 不显示 `返工复验已放行`。
- 不显示 `.barcode-release-message` 成功消息。
- `localStorage.aimes_otd_evidence_chain` 仍包含 active 证据。
- 本地证据不包含以下伪造释放 trace：
  - `TRACE-QR-WO-RUSH-9001-OP-10-RECHECK`
  - `TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20`
  - `TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE`
  - `TRACE-QR-WO-RUSH-9001-OP-10-LABEL-RELEASE`

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
