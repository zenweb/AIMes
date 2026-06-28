# 2026-06-20 Review - 人员停工复核单次 reviewing Upsert

## 结论
- 通过，当前切片已关闭。

## 审查点
- 根因明确：复核按钮在没有本地 active block 时先调用普通阻断持久化，再调用复核持久化，导致同一业务键写两次。
- 前端修复保持最小范围，只改变复核按钮的持久化路径，不改变替班建议和补证放行链路。
- 后端增加重复数据收敛，避免历史重复或并发残留继续污染查询结果。
- 集成测试覆盖“人为插入重复记录后再次 upsert 应收敛为单条 reviewing”。
- 真实浏览器证据覆盖实际登录、员工页、按钮点击、网络 POST 数量和页面降级文案。

## 残余风险
- 浏览器日志中仍出现页面跳转期间的 SignalR negotiate `net::ERR_ABORTED` 噪声；本次员工页主链路无失败文案、接口成功且数据正确，SignalR 生命周期噪声需作为独立切片继续归因。

## 证据
- 数据库重复组：0。
- 目标记录状态：`reviewing`。
- 真实浏览器截图：`src/frontend/output/playwright/labor-qualification-review-single-upsert.png`。
