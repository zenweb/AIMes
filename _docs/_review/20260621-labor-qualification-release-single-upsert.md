# 2026-06-21 Review - 人员停工复核放行单次 Upsert

## 结论
- 通过，当前切片已关闭。

## 审查点
- 根因与复核路径一致：放行按钮在没有本地 active block 时通过 `ensureQualificationBlock()` 先持久化中间 `active`。
- 修复范围只限放行按钮调用方式和对应单测，没有改变替班记录结构、审计字段或后端接口。
- 真实浏览器证明确认：放行链路只写最终 `released` 阻断和 `approved` 替班，不再写 `active` 中间态。
- 数据库证明确认：两类人员证据均无重复组，业务 key 状态一致。

## 残余风险
- 页面跳转期间仍有 SignalR negotiate `net::ERR_ABORTED` 控制台噪声；本切片业务请求均为 200，SignalR 生命周期噪声继续保留为独立后续项。

## 证据
- 前端 35 条人员相关单测通过。
- 前端 production build 通过。
- 真实浏览器截图：`src/frontend/output/playwright/labor-qualification-release-single-released-upsert.png`。
- 数据库最终状态：`LaborQualificationBlock=released`，`LaborReassignment=approved`。
