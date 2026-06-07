# 2026-06-07 Issue - MonitoringBoard 初始化治理证据加载失败 Chromium 证据

## 问题

`MonitoringBoard` 已有初始化治理证据加载失败的页面提示，但真实 HTTP 503 会被 POC Hypercare 与现场态势处置包 helper 吞成 `null` / `[]`，导致真实浏览器无法展示 `现场态势初始化读取失败`。

## 影响

如果初始化治理证据读取失败时没有 fail-loud，生产经理可能误以为 Hypercare、现场处置包和上线后监控状态可信，影响首次灰度后的观察判断和现场风险升级。

## 处理

- 为 Hypercare 与现场态势处置包读取增加显式 `failLoud` 模式。
- MonitoringBoard 初始化读取启用 `failLoud`，让后端失败进入既有提示分支。
- 保持其他调用默认 best-effort 回退，避免扩大行为变更。
- 新增真实 Chromium e2e，拦截两个治理证据接口返回 503。

## 状态

A 轨此切片已用单元测试和 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
