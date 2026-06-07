# 2026-06-05 Issue - Document Upload Payload Guard

## Issue

知识库文档上传接口如果返回 HTML / 非业务载荷，旧逻辑会把该响应当成成功结果，导致队列显示“已上传”，并把空审计编号、空文件名写入上传历史。

## Risk

- 知识库治理历史被坏记录污染。
- AI 助手后续引用链可能基于不存在的文档审计编号。
- preview / 反向代理 HTML fallback 可能再次掩盖 API 路由错误。

## Resolution

- 新增上传坏载荷红灯测试。
- 新增 `isDocumentUploadResponse()` 守卫。
- 坏载荷走行级失败路径，历史表保持“暂无上传记录”。

## Status

- A-track：已完成并验证。
- B-track：未关闭；仍需 hosted CI、staging、攻击链、安全签字、灰度与 14 天观察证据。
