---
name: aimes-v1-design
description: AIMes V1 设计总览 — 包含开源版与商业版两条产品线
metadata:
  version: v1
  last_updated: 2026-05-15
---

# AIMes V1 — 设计总览

## 性质

V1 包含两个版本：

- **开源版**：工厂可独立部署的「确定性」MES，AI 排产仅含规则引擎，向量检索 / Agent 编排以接口占位 + 演示数据形态存在；许可证 Apache 2.0。
- **商业版**：在开源版基础上扩展的「生产决策中枢」，提供 LLM 多目标优化、视觉质检真实推理、Qdrant 向量检索、多车间协同、K8s / 多租户 / SLA 等能力；商业许可。

两个版本共享同一套数据库 / API 形态，商业版是开源版的**超集**，可以平滑升级。

## 关联文档

| 文档 | 用途 |
|------|------|
| [`aimes-design-doc.v1.md`](aimes-design-doc.v1.md) | V1 已落地基线（权威设计文档） |
| [`aimes-design-doc_audit.md`](aimes-design-doc_audit.md) | 设计文档与代码差异审计 |
| [`../commercial-vs-opensource.md`](../commercial-vs-opensource.md) | 开源版 vs 商业版完整功能边界对照 |

## 版本与边界

详细的功能边界、模型版本、许可、升级路径，以 `commercial-vs-opensource.md` 为准。本文档只声明「V1 是双版本并行」这一性质，不重复列举条目。
