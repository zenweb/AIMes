# 2026-06-06 ScheduleBoard 风险看板读取失败 Plan

## Success Criteria

- 真实 Chromium 进入 `ScheduleBoard` 风险看板读取分支。
- `/api/v1/risk/dashboard` 被测试路由真实命中并返回 503。
- 页面展示风险事件加载失败状态，且具备可访问的 polite status。
- 本地演示事件队列仍显示三类调度风险事件。

## Execution

- 先用请求计数定位初始失败根因，确认风险接口未被命中。
- 固定排产计划、设备列表、瓶颈设备成功前置，排除外层排产 fallback 干扰。
- 保持生产代码不变，只补真实浏览器证据。

## Stop Condition

- 目标 e2e 通过。
- 文档记录变更、验证、残余风险和下一步。
- 不继续扩展新切片。
