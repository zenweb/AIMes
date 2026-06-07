# 2026-06-05 Issue - Chat Knowledge Payload Guard

## Issue

AI 助手知识问答接口如果返回 HTML / 非业务载荷，旧逻辑会直接读取 `res.answer` 和 `res.sources`，导致 `undefined` 消息进入渲染链并触发运行时错误。

## Risk

- 用户发送问题后聊天面板可能崩溃或卡在 loading 状态。
- preview / 代理 HTML fallback 会掩盖 API 路由错误。
- AI 助手是用户主入口，不能让坏 API 响应破坏整个对话体验。

## Resolution

- 新增知识问答坏载荷红灯测试。
- 新增 `isKnowledgeQueryPayload()` 守卫。
- 坏载荷走现有离线演示回答，并 assertive 暴露失败原因。

## Status

- A-track：已完成并验证。
- B-track：未关闭；仍需 hosted CI、staging、攻击链、安全签字、灰度与 14 天观察证据。
