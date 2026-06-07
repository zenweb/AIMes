# PurchaseBoard 确认失败真实浏览器证据

日期：2026-06-06

## 目标

补齐采购协同状态变更失败路径的 Chromium 证据：确认采购订单接口失败时，页面必须 fail loud，并保留采购单 `已提交` 状态，不能误变为 `已确认`。

## 本轮变更

- 在 `src/frontend/tests/e2e/purchase.spec.ts` 新增 `确认采购订单接口失败时保留已提交状态并告警`。
- 用 Playwright route 拦截真实浏览器 POST `**/api/v1/purchase/*/confirm`，返回 409 + `supplier credit hold from chromium`。
- 测试显式关闭浏览器本地 `aimes_offline_demo`，避免离线演示错误替代真实接口失败。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "确认采购订单接口失败"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\purchase.spec.ts:60:3 › Purchase 采购协同 › 确认采购订单接口失败时保留已提交状态并告警 (2.4s)
1 passed (7.3s)
```

验证点：

- Chromium 真实触发 1 次 POST `/api/v1/purchase/{id}/confirm`。
- `.purchase-notification` 显示 `确认失败` 和后端错误消息。
- 详情区状态仍为 `已提交`。
- 列表项 `PO-20260502` 仍显示 `已提交`。
- `确认` 按钮仍可见，用户可在问题解除后重试。

## 边界

- 本轮未修改产品逻辑，只补真实浏览器证据。
- 未跑完整采购 e2e 套件。
- 未关闭 B 轨发布闸门。
