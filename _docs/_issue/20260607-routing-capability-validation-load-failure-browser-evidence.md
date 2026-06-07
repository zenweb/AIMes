# 2026-06-07 Issue - RoutingBoard 能力校验记录加载失败 Chromium 证据

## 问题

`RoutingBoard` 已有能力校验历史加载失败的页面 alert 分支，但真实 HTTP 503 会被 `getLatestRouteCapabilityValidation()` catch 成 `null`，再由 backend-first helper 回退本地读取，导致真实浏览器无法展示 `能力校验记录加载失败`。

## 影响

如果能力校验历史读取失败时没有 fail-loud，计划员可能把页面上的能力校验状态误认为可信历史结论，进而影响 `R-B200 OP-090` 热处理瓶颈、分流/合批、夜班窗口和外协兜底判断。

## 处理

- 为能力校验读取增加显式 `failLoud` 模式。
- RoutingBoard 启用 `failLoud`，让后端失败进入既有 alert 分支。
- 保持其他调用默认 best-effort 回退，避免扩大行为变更。
- 新增真实 Chromium e2e，拦截 `/api/v1/scheduling/route-capability-validation/latest` 返回 503。

## 状态

A 轨此切片已用单元测试和 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
