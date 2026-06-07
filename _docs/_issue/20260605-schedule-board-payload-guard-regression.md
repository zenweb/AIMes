# 2026-06-05 Issue - ScheduleBoard Payload Guard Regression

## Issue

排产主入口曾暴露过 Nuxt preview / SPA HTML fallback 被当作 API 业务数据的风险。生产实现已增加运行时载荷守卫，但缺少单测直接锁定 `ScheduleBoard` 的计划载荷与设备载荷坏数据 fallback 行为。

## Risk

- 用户必经的排产页可能在无后端 preview、反向代理误路由或 API 返回 HTML 时写入坏状态。
- 如果只靠 E2E 覆盖，后续局部重构可能绕开 `ScheduleBoard` 载荷守卫而不被快速发现。

## Resolution

- 新增计划载荷坏数据回归测试。
- 新增设备分页载荷坏数据回归测试。
- 两个测试均要求页面保留演示排产 fallback，并以 polite status 暴露 fallback 原因。

## Status

- A-track：已完成并验证。
- B-track：未关闭；仍需真实 GitHub hosted CI、staging rehearsal、攻击链验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
