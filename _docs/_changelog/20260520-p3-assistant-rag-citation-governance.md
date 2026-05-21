# 2026-05-20 P3 AI 助手 RAG 引用治理

## 变更

- 新增 `knowledge-citations.ts`，统一维护 AI 助手业务问答的引用来源、回答意图、阻断来源和治理状态。
- `AI 生产助手` 三类业务问答在演示降级模式下也会返回对应 RAG 来源，并在回答正文中提示引用治理与阻断来源。
- `文档上传` 的 RAG 数据治理页新增“AI 助手引用链”，展示业务问答如何引用 SOP、BOM 替代料、风险队列、OTD 复盘和设备影响记录。

## 验证

- 待运行：`npm run test:e2e -- tests/e2e/chat.spec.ts tests/e2e/knowledge.spec.ts -g "业务问答|引用链"`
