# T-34 Brainstorm 真分册

> 2026-05-23 | D 类工程债

## 完成内容

把 1662 行的 `20260519-function-deepening-brainstorm.md` 拆分为 < 500 行的主线文档 + 独立 capability docs。

### 主线文档
- 保留版本定位、结论先行、功能现状扫描表
- 各模块详情替换为跳转链接 → `_docs/_capability/v15-*.md`
- 保留 Sprint A/B/C/D 推进摘要
- 保留 Demo 路径 + 非目标
- 最终行数：**176 行**（目标 < 500 ✅）

### 新增 12 份 Capability Docs
| 模块 | 文件 |
|------|------|
| 报表中心→经营复盘 | `v15-report-center.md` |
| 指挥中心+现场态势 | `v15-dashboard-and-monitoring.md` |
| 调度员 Agent 工作台 | `v15-scheduler-agent-workbench.md` |
| 风险预警→行动队列 | `v15-risk-action-queue.md` |
| 缺料齐套闭环 | `v15-material-kitting.md` |
| 设备故障与瓶颈联动 | `v15-equipment-bottleneck.md` |
| 生产执行闭环 | `v15-production-execution.md` |
| 质量闭环+R3-R7 链 | `v15-quality-loop.md` |
| 异常→现场事件中心 | `v15-anomaly-event-center.md` |
| 工程数据→约束来源 | `v15-engineering-constraints.md` |
| AI 生产助手→可执行 | `v15-executable-assistant.md` |
| 人员能力约束 | `v15-labor-constraints.md` |
| 条码现场入口 | `v15-barcode-field-entry.md` |
| 知识治理与 RAG | `v15-knowledge-governance.md` |
| Agent 治理与审计 | `v15-agent-governance.md` |

### 索引更新
- `_docs/_changelog/README.md` 新增 Capability Docs 索引章节

## 验证
- brainstorm 主文档: 176 行 ✅
- 每个 capability doc 自洽可读 ✅
- 索引引用完整 ✅
