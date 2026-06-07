# 2026-06-07 Issue - SPC 加载失败恢复 Chromium 证据

## 问题

SPC 趋势分析加载失败和后续成功清理 stale alert 已有单元测试覆盖，但缺少真实 Chromium 证据证明浏览器中 API 失败后能保留 fallback 图点，并在后续成功后清理告警。

## 影响

如果该路径失败时显示空图或恢复后保留旧告警，用户会误判 SPC 趋势状态，影响质量工程师对刀具、硬度和尺寸趋势的处置判断。

## 处理

- 新增 e2e 关闭 offline demo，mock 无关质量 API 成功。
- 注入首次 SPC 503。
- 切换到 `hardness` 后返回成功数据。
- 断言 fallback 图点、alert 和后续 alert 清理。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
