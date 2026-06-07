---
name: v15-report-center
description: P0 报表中心升级为经营复盘工作台 — OTD 钻取、客户承诺包、POC 签署全链路
---

# 报表中心 → 经营复盘工作台 (P0)

## 概述

将报表中心从"结果展示"升级为经营复盘工作台，管理者可回答"改善来自哪条证据、哪个模块负责、下一步去哪处理"。

## 实现范围

### OTD 钻取与多维分析
- 经营复盘钻取面板，将 OTD 证据映射为业务问题、责任口径、风险状态和下一步动作
- KPI 多维钻取：客户维度（华东新能源 76%→94%）、产线维度（CNC 瓶颈保护）、产品族维度（阀体组件/法兰盘 DN100）、时间窗口维度
- 外协承诺与到货闭环：法兰盘 DN100 外协厂承诺 → 采购收货 → 排产释放 → OTD 归档

### 客户承诺包
- 客户交付恢复承诺包：基线 OTD 76%、Agent OTD 94%、延期减少 3 单
- 同步到 AI 排产事件队列、审计回放、AI 生产助手问答

### POC 上线交付
- 上线交付行动包：T+1/T+3/T+7/T+14 四类行动
- 首批真实工单试点（PILOT-WO-BATCH-30 单）
- Hypercare 7 天稳定运行监控（OTD 97%、OEE 82%）
- POC 复盘签署（100/100 分）、CSV 导出

## 关键文件
- `20260519-sprint-a-otd-impact-panel.md` — OTD 影响面板
- `20260520-otd-evidence-chain.md` — OTD 证据链初版
- `20260520-otd-evidence-chain-unified-sources.md` — 统一来源
- `20260520-sprint-d-otd-improvement-report.md` — OTD 改善报告
- `20260521-report-otd-drilldown.md` — OTD 钻取
- `20260521-report-otd-kpi-drilldown.md` — KPI 级钻取
- `20260523-assistant-customer-commitment-package.md` — 客户承诺包

## 验证状态
- e2e: Report 模块 17+ passed，覆盖 OTD 钻取、KPI 多维、客户承诺、POC 签署、CSV 导出
- 前端 demo：localStorage `aimes_otd_kpi_commitment_packages` / `aimes_poc_rollout_package`
