# Issue：PurchaseBoard 新建按钮真实浏览器点击被截获

## 状态

已在本轮最小修复并由目标 Chromium 用例验证。

## 现象

新增失败路径 e2e 的 RED 阶段，Playwright 无法点击 `+ 新建`。错误显示：

```text
<section aria-label="供应网络治理" class="supplier-network-panel"> intercepts pointer events
```

## 根因

采购页根容器固定 `height: 100%`，上方缺料、供应风险、供应网络等治理面板增多后，订单区在真实浏览器视口内被压缩，导致按钮点击命中被上方区块截获。

## 修复

- `po-board`: `height: 100%` -> `min-height: 100%`
- `board-body`: 使用稳定内容区和 `min-height: 520px`

## 防回归证据

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "新建采购订单接口失败"
```

结果：`1 passed`。
