# PurchaseBoard 收货失败真实浏览器证据

日期：2026-06-06

## 目标

补齐采购协同收货失败路径的 Chromium 证据：采购收货接口失败时，页面必须 fail loud，收货弹窗保持打开，采购单状态和物料已收数量不能被误推进。

## 本轮变更

- 在 `src/frontend/tests/e2e/purchase.spec.ts` 新增 `收货接口失败时保留收货弹窗和已确认状态并告警`。
- 用 Playwright route 拦截真实浏览器 POST `**/api/v1/purchase/*/receive`，返回 409 + `received quantity exceeds remaining from chromium`。
- 测试显式关闭浏览器本地 `aimes_offline_demo`，避免离线演示本地错误替代真实接口失败。
- 本轮未修改产品逻辑。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "收货接口失败"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\purchase.spec.ts:93:3 › Purchase 采购协同 › 收货接口失败时保留收货弹窗和已确认状态并告警 (1.9s)
1 passed (5.2s)
```

验证点：

- Chromium 真实触发 1 次 POST `/api/v1/purchase/{id}/receive`。
- `.purchase-notification` 显示 `收货失败` 和后端错误消息。
- 收货弹窗仍可见。
- `PO-20260501` 详情状态仍为 `已确认`。
- `MAT-A01` 已收数量仍为 `0`。
- `收货` 按钮仍可见。

## 边界

- 未修复收货弹窗缺少 `role="dialog"` 的 a11y 问题；该点可作为后续单独切片。
- 未跑完整采购 e2e。
- 未关闭 B 轨发布闸门。
