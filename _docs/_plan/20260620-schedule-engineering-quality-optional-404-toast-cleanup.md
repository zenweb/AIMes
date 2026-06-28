# 2026-06-20 Plan - Schedule 工程/质量 optional 404 toast 清理

## 成功标准
- 可选工程/质量 latest 证据 404 不触发全局 `请求错误` toast。
- 404 作为空状态返回 `null`。
- 非 404 失败在 `failLoud` 场景继续抛出。
- 真实浏览器能区分 optional evidence 噪声和核心排产数据缺失。

## 执行结果
- 已补充工程/质量 evidence API 合同测试。
- 已同步更新相关 sync 测试的 HTTP 调用期望。
- 已通过定向单测、前端构建和真实浏览器复验。

## 边界
- 不处理 `/scheduling/current` 的核心数据 404。该问题需单独读取 `ScheduleBoard` 加载策略后决定是后端补 seed/current，还是前端改为页面内 fail-loud。

