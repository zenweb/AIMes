# 2026-06-05 ChatPanel Navigation Fail-loud Issues

## Fixed

- 问题：`ChatPanel.vue` 的普通导航动作在 `router.push()` 失败时没有显式失败告警。
- 风险：用户会误判成按钮无响应或助手卡死，无法区分“导航失败”和“动作未执行”。
- 处理：普通导航 / `schedule_suggestion` 动作增加 try/catch，失败时显示 assertive alert。
- 问题：普通导航失败没有回归测试。
- 风险：同类 silent crash 可能在后续动作重构中复发。
- 处理：新增 unit 覆盖 `打开风险预警` 导航失败场景，并断言 alert 文案。

## Remaining

- `ChatPanel.vue` 仍可继续审计其它 action 分支，但不应在已收口的普通导航失败点上重复切片。
- 本片未关闭 Hosted CI、staging、攻击链、安全签字、灰度和 14 天观察等 B-track 发布门。
