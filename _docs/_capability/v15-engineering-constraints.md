---
name: v15-engineering-constraints
description: P2 工程数据变约束来源 — BOM 替代料、工艺能力、ECN、齐套展开
---

# 工程数据 → 约束来源 (P2)

## 概述

把 BOM 管理、工艺路线从基础资料维护升级为排产约束来源，让 Agent 建议引用真实工程数据。

## 实现范围

### BOM 排产约束
- BOM-A100 替代料规则：M-AL-6061B 可替代 M-AL-6061
- 替代料工程确认 → 正式释放排产约束
- ECN 工程变更影响分析 → 审批前模拟 → 批准/驳回 → 排产释放/撤回
- BOM 展开齐套检查包 → 库存齐套 + 排产事件

### 工艺路线约束
- R-A100 CNC 能力匹配：标准工时、可用设备、换线代价
- 质量参数约束：扭矩检验窗口不可取消
- 工艺能力校验 → 热处理分流/合批确认 → 排产复核

### AI 集成
- AI 排产工程约束解释面板
- AI 生产助手可解释 ECN 对排产和 OTD 的影响
- Agent 治理：工程变更治理、工艺能力治理
- 审计回放：工程约束/工程变更/工艺能力三类专属回放

## 关键文件
- `20260520-p2-engineering-constraints.md` — 工程数据转排产约束
- `20260521-engineering-change-impact-analysis.md` — ECN 影响分析
- `20260521-route-capability-validation.md` — 工艺路线能力校验

## 验证状态
- e2e: Engineering data 模块 8 passed（BOM 约束、ECN 审批、工艺能力）
- e2e: Admin 工程变更治理、工艺能力治理
- e2e: BOM 展开齐套包进入库存/排产/审计
