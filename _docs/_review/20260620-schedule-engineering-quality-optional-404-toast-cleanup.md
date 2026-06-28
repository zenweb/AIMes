# 2026-06-20 Review - Schedule 工程/质量 optional 404 toast 清理

## 结论
- 通过。工程变更、替代料、路线能力、返工影响、MRB 处置这些 optional latest 证据在暂无记录 404 时不再弹全局 `请求错误`。

## 审计点
- optional 404：作为空状态返回 `null`，符合“暂无证据”语义。
- 非 404 失败：`failLoud` 仍抛出，未把真实后端异常吞掉。
- 变更范围：仅 API 合同层与对应单测期望，未改排产页面核心加载逻辑。

## 剩余风险
- `/scheduling/scheduling` 真实浏览器仍显示 `请求错误未找到当前排产计划`，来源是核心 `/api/v1/scheduling/current` 404。本轮未静默它，因为当前排产计划属于核心数据，不是 optional evidence。

