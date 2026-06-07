---
name: v15-agent-governance
description: P3 Agent 治理与审计决策回放 — 权限策略、配置审批、AI 决策回放
---

# Agent 治理与审计决策回放 (P3)

## 概述

将系统管理升级为 Agent 策略与权限治理中心，审计日志升级为 AI 决策全链路回放。

## 实现范围

### Agent 策略与权限治理
- 可执行 Agent 动作、所需角色、执行状态和审计编号
- 执行策略摘要：置信度阈值 0.80、锁定期保护 8h
- 关键配置变更审批（锁定期 8h→10h、置信度 0.72→0.80）
- 审批通过/驳回 → 即时更新状态 → 审计日志回放
- Agent Permission Policy：5 角色 × 5 动作权限矩阵（C# 后端实现）

### AI 决策回放
- AI 建议 → 人工采纳 → 重排动作 → 复盘证据串成可解释证据链
- 回放数据：急单插入决策、采购收货释放、配置变更审批
- 专属回放卡覆盖 20+ 类型（设备停机、异常分流、质量灰度、OTD 证据链等）
- 审计指标：AI 建议留痕、重排动作回放、配置审批中、证据链覆盖

### 统一 OTD 证据链治理
- Agent 治理读取统一证据链，按阶段展示各模块执行记录
- OTD 复盘证据治理区块：采购回写、设备维护、生产完工、质量回写

## 关键文件
- `20260520-p3-agent-config-approval.md` — Agent 配置审批
- `20260520-p3-audit-decision-replay.md` — AI 决策回放
- `_docs/_capability/v15-security-audit-policy.md` — 权限审计策略

## 验证状态
- e2e: Admin 模块 29+ passed（Agent 治理、配置审批、各模块治理区块）
- e2e: Audit 模块多类型回放卡 passed
- 后端：AgentPermissionPolicyTests 37/37 + SchedulingControllerTests 118/118
