# 2026-06-20 Issue - Schedule current 404 触发重复全局 toast

## 现象
- `/scheduling/scheduling` 首屏在后端没有当前排产计划时显示全局 `请求错误未找到当前排产计划`。
- 同时页面已经回退演示排产数据，并通过 warning 区展示后端失败原因。

## 根因
- `getCurrentPlan()` 使用默认 HTTP GET，404 被全局拦截器展示为 toast。
- `ScheduleBoard` 自身已有页面内 fail-loud/fallback 逻辑，导致同一核心失败被提示两次。

## 处理
- `getCurrentPlan()` 增加 `{ suppressErrorToast: true }`。
- 保留异常抛出，让页面内 warning 继续负责核心失败展示。

## 状态
- 已修复重复全局 toast。
- 真实 current plan 数据缺失仍需后端 seed/current 另行解决。

