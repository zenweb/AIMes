# Review: Audit Replay 业务落库审计详情失败真实浏览器证据

日期：2026-06-06

## 结论

- 未发现本片新增阻断问题。
- 业务落库审计详情 503 失败态已有真实 Chromium 证据。
- 审计回放页面在单条业务审计详情失败时不会吞掉其他成功回放，仍保留成功采购收货回放卡片，并通过 assertive alert 显示失败原因。

## 证据

- 新增 e2e 拦截审计列表返回两条 `AgentExecutePurchaseAction` 记录。
- 成功详情卡片显示：`采购收货落库：PO-DETAIL-OK-001`、`MAT-DETAIL-6061 收货 12`。
- 失败详情返回 503：`audit detail unavailable from chromium`。
- `.replay-sync-alert` 显示 `业务落库审计详情加载失败` 和 `audit detail unavailable from chromium`。
- e2e 中断言失败详情路由命中数大于 0，确认失败来自真实 API 路径。
- 完整审计 Chromium 套件：14/14 passed。

## 剩余风险

- 本片只覆盖业务落库审计详情接口失败路径。
- B 轨道发布闸门仍缺人工、环境和时间窗口证据，不能声明发布完成。
