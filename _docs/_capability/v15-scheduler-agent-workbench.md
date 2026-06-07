---
name: v15-scheduler-agent-workbench
description: P0 调度员 Agent 工作台 — 工单池、多方案对比、采纳/拒绝、执行追踪
---

# 调度员 Agent 工作台 (P0)

## 概述

将 AI 排产从"甘特图页面"升级为"调度员每天打开的工作台"。

## 实现范围

### 工作台聚合面板
- 工单池：待排、已排、风险、插单（突出 WO-RUSH-9001）
- 排产方案对比：人工基线 / Agent 推荐 / 人工调整
- 推荐解释：锁定期、CNC 空窗、延期减少
- 执行追踪：建议生成 → 人工决策 → 执行回写 → 审计复盘

### 任务级排产解释
- 对任意任务条解释：交期、设备、前置工序、缺料、瓶颈
- 展示 Agent 推荐理由、风险提示、可替代方案

### 多方案决策包
- 急单插单场景：加班插入 / 强插当前窗口 / 换设备插入 三方案
- 每个方案展示 OTD 影响、延期影响、换线影响、不选原因
- 采纳后保留推荐方案、未选方案和决策依据

## 关键文件
- `20260522-schedule-agent-scenario-package.md` — 多方案决策包
- `_docs/_capability/v15-otd-scheduling-agent.md` — A/B 基准
- Scheduling 模块 e2e: 20 passed

## 验证状态
- e2e: 调度员工作台展示、事件建议采纳、任务级解释、多方案决策包
- MES.Tools.AbBenchmark 真实 A/B 计算（26.67% baseline / 30.00% agent，p=0.7745）
