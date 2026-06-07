# 2026-06-06 ChatPanel 知识问答失败 Issue

## Issue

`ChatPanel` 知识问答失败路径已有单元覆盖，但缺真实浏览器证据。AI 助手是用户必经入口，RAG 服务异常时必须确认用户能看到 fail-loud 原因并继续使用离线回答。

## Resolution

- 增加真实 Chromium e2e，拦截 `/api/v1/knowledge/query` 返回 503。
- 断言目标 alert 展示错误原因、离线回答和可继续输入。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
