# 2026-06-07 Issue - 质量灰度决策非数组载荷缺真实浏览器证据

## 问题

`AuditDecisionReplayPanel` 组件层已有质量灰度决策非数组载荷告警，但真实浏览器此前只覆盖接口 503 失败，没有覆盖 `/api/v1/scheduling/quality-knowledge-evidence?evidenceType=QualityKnowledgeGrayReleaseDecision` 返回 200 非数组载荷。

## 根因

质量知识证据同步工具依赖 TypeScript 泛型接收数组。若真实响应返回 `{ items: [] }`，缺少运行时数组校验时，坏载荷可能被当作空结果处理，而不是暴露为审计证据异常。

## 影响

质量灰度决策属于发布灰度和回滚审计证据。坏载荷如果被静默吞掉，审计回放会看起来像“没有灰度决策证据”，而不是暴露后端载荷异常。

## 处理

- 为质量知识证据 payload 读取增加运行时数组校验。
- 非数组载荷抛出 `后端返回非数组审计载荷`。
- 新增工具单元测试验证质量灰度决策坏载荷 fail-loud。
- 新增真实 Chromium e2e 验证非数组载荷时保留基础回放并展示质量灰度决策加载失败。

## 状态

已通过质量知识同步工具定向单元、组件定向单元和真实 Chromium e2e。
