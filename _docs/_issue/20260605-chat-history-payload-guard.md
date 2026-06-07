# 2026-06-05 Issue - Chat History Payload Guard

## Issue

AI 助手聊天历史接口如果返回 HTML / 非业务载荷，旧逻辑会把 `history.messages` 当可选字段处理，结果静默显示空聊天状态，没有告诉用户后端返回了坏载荷。

## Risk

- 用户会误以为没有历史记录，而不是知道聊天历史加载异常。
- preview / 反向代理 HTML fallback 可能再次掩盖 API 路由错误。
- AI 助手是用户主入口，静默失败会降低发布可信度。

## Resolution

- 新增聊天历史坏载荷回归测试。
- 新增 `isChatHistoryPayload()` 守卫，要求 `messages` 为数组。
- 坏载荷复用现有 assertive alert，提示“聊天历史加载失败：后端返回非聊天历史载荷”。

## Status

- A-track：已完成并验证。
- B-track：未关闭；仍需 hosted CI、staging、攻击链、安全签字、灰度与 14 天观察证据。
