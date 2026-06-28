# 20260619 Purchase Outsourcing Receipt Guidance Links Issue

## 问题
采购协同的外协承诺到货确认区允许用户确认外协到货并释放排产路径，但操作前缺少本地中英双语核对提示、上下文链接和帮助锚点。

## 影响
- 用户可能在未核对承诺追踪、外协厂、影响工单、到货责任人和排产释放路径时确认到货。
- 风险、排产、报表证据之间的跳转不够直接。
- 复杂操作缺少帮助支持，不符合当前核心产品原则。

## 处理
- 新增 `#outsourcing-receipt-help` 引导区。
- 增加风险预警、AI 排产、报表证据、帮助四个入口。
- 将 `.outsourcing-receipt-panel` 通过 `aria-describedby` 关联到帮助提示。

## 状态
- 已修复并完成单测、全量覆盖率、lint、build、真实浏览器验证。
