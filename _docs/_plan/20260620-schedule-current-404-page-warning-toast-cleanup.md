# 2026-06-20 Plan - Schedule current 404 页面内告警 toast 清理

## 成功标准
- `/scheduling/current` 404 不再弹全局 `请求错误` toast。
- 排产页仍展示可理解的页面内 fallback warning。
- 异常继续从 `getCurrentPlan()` 抛给调用方，不把核心数据缺失伪装成成功。

## 执行结果
- 已通过 TDD 红灯确认请求缺少 suppress 配置。
- 已最小修改 `getCurrentPlan()`。
- 已通过 `scheduling-api` 与 `schedule-board` 定向单测。

## 后续验证
- 跑 build。
- 重启 4173 预览并用真实浏览器确认 `/scheduling/scheduling` 无全局 `请求错误` toast。

