# PurchaseBoard 新建采购失败真实浏览器证据

日期：2026-06-06

## 目标

补齐采购协同核心路径的 Chromium 失败证据：新建采购订单接口返回失败时，页面必须 fail loud，不关闭弹窗，不把失败订单插入列表。

## 本轮变更

- 在 `src/frontend/tests/e2e/purchase.spec.ts` 新增 `新建采购订单接口失败时保留弹窗并告警`。
- 测试通过 Playwright route 拦截真实浏览器 POST `**/api/v1/purchase`，返回 503 + `supplier master data missing from chromium`。
- 测试显式关闭浏览器本地 `aimes_offline_demo`，避免把离线演示本地错误误当成后端接口失败。
- 修复 `src/frontend/src/components/purchase/PurchaseBoard.vue` 的采购页纵向布局：`po-board` 改为 `min-height: 100%`，订单区 `board-body` 改为稳定内容区，避免真实浏览器里 `+ 新建` 被上方供应网络治理区块截获点击。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "新建采购订单接口失败"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\purchase.spec.ts:24:3 › Purchase 采购协同 › 新建采购订单接口失败时保留弹窗并告警 (1.6s)
1 passed (4.5s)
```

验证点：

- Chromium 真实触发 1 次 POST `/api/v1/purchase`。
- 503 响应后组件内 `.purchase-notification` 显示 `创建失败` 和后端错误消息。
- `新建采购订单` dialog 保持可见。
- `PO-CHROMIUM-FAIL-001` 未出现在采购订单列表。

## 发现并修复的真实浏览器问题

RED 阶段发现 `+ 新建` 按钮在 Chromium 中无法点击，Playwright 报告上方 `供应网络治理` 区块截获 pointer events。根因是采购页根容器固定 `height: 100%`，上方治理面板增多后压缩了订单区命中空间。最小修复后同一条 Chromium 用例通过。

## 边界

- 未关闭 B 轨发布闸门。
- 未声称 hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度或 14 天 P0/P1=0 已完成。
- `PurchaseBoard.vue` 和 `purchase.spec.ts` 在本轮前已有大量既有 diff；本报告只覆盖本轮新增测试和最小 CSS 可点击性修复。
