# 2026-06-20 Review - Schedule current 404 页面内告警 toast 清理

## 结论
- 通过。核心 `/scheduling/current` 404 不再额外触发全局 toast，但页面内仍保留可见失败原因。

## 审计点
- 没有把核心排产计划缺失静默处理为成功。
- 页面内 `.warnings-bar` 保持 `role="status"` 与 `aria-live="polite"`，用户仍能看到“当前显示演示排产数据”和后端失败原因。
- 修复位置在 API 请求配置层，未扩大排产功能范围。

## 剩余风险
- 后端当前环境仍没有真实 current plan 数据；本片解决的是前端重复全局 toast 噪声，不等价于补齐真实排产计划 seed/current。

