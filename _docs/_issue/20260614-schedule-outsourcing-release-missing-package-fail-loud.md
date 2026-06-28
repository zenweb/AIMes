# 2026-06-14 Issue - 外协排产释放缺失承诺包静默失败

## 问题
- `adoptAgentSuggestion` 在外协到货建议采纳后调用 `confirmOutsourcingScheduleRelease`。
- 当该函数返回 `null` 时，旧逻辑直接 `return`。
- 用户只看到“反馈已同步后台”，但外协释放审计没有归档，也没有 OTD 证据链释放记录。

## 影响
- 用户关键路径：外协到货后由 AI 排产采纳并关闭厂外等待口径。
- 风险类型：静默失败、审计证据缺口、OTD 复盘口径误判。
- 严重性：中高，属于现有精品功能的闭环可观察性缺口。

## 修复
- 在 `confirmOutsourcingScheduleRelease` 返回空值时显示 fail-loud 反馈。
- 文案明确“采纳反馈已保留但释放审计未归档”，并附带 `sourceKpiId`。
- 不生成“外协排产释放已确认”建议，避免制造错误闭环。

## 验证
- 单测覆盖返回空值分支。
- Chromium 真实浏览器覆盖本地承诺包在采纳前缺失的交互路径。
