# 2026-06-20 Dashboard 短缺证据 optional 404 toast 清理

## 变更
- `shortageEvidence` 的五个 optional latest 读取统一携带 `{ suppressErrorToast: true }`：
  - `shortage-kitting/latest`
  - `shortage-risk-resolution/latest`
  - `bom-kitting-package/latest`
  - `supply-risk-escalation/latest`
  - `supplier-network-decision/latest`
- optional latest 返回 404 时统一视为“暂无记录”并返回 `null`，即使调用方传入 `failLoud: true` 也不把 404 当作真实后端失败。
- 补充 `shortage-evidence-api` 合同测试，锁定 suppress toast 与 404 空状态行为。

## 验证
- `npm run test:unit -- tests/unit/shortage-evidence-api.test.ts tests/unit/shortage-risk-sync.test.ts tests/unit/dashboard-board.test.ts`
- `npm run build`
- 真实浏览器验证 `/scheduling/dashboard`：`poc-hypercare-acceptance/latest`、`risk-sla-review/latest`、`shortage-risk-resolution/latest` 仍返回 404，但页面不展示 `请求错误`、`Offline demo mode skipped backend request` 或 `生产概览数据读取失败`。

