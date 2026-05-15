# AIMes — 智能制造执行系统（开源版）

> 工厂的产线管理员每天都在「救火」。AIMes 让 MES 从「记账式」升级为「会预测的助手」——
> AI 排产、风险预警、决策可追溯，开箱即用。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-v0.1.0-green)](CHANGELOG.md)
[![.NET](https://img.shields.io/badge/.NET-10-512BD4)](https://dotnet.microsoft.com/)
[![Vue](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org/)

![排程甘特图](_docs/screenshots/02-scheduling-gantt.png)
*AI 排程引擎：设备分组、瓶颈高亮、冲突闪烁、拖拽调整。点击查看 [更多截图](_docs/screenshots/)。*

---

## 这是什么

**AIMes** 是一个以 AI 排产排程为核心的开源 MES（制造执行系统），目标用户是**产线管理员 / 工厂 IT**。

- 🎯 **AI 排程**：规则引擎（EDD/SPT/WSPT）+ 多目标优化 + 约束求解
- 📊 **实时看板**：排程甘特图、生产概览、SPC 质量图、风险预警
- 🔔 **主动预警**：工单延期、设备故障、物料齐套、产能瓶颈四类风险
- 🔍 **决策可追溯**：每个 AI 决策都有 prompt hash / context / input-output 链路
- 🛡️ **企业基线**：JWT 认证、速率限制、Token 轮转、审计日志

---

## 5 分钟启动

需要：Docker Desktop ≥ 4.20 / 8GB RAM / 20GB 磁盘可用空间。

```bash
git clone https://github.com/YOUR_ORG/aimes.git
cd aimes/v1
docker compose up -d
```

等待约 30 秒（首次拉镜像约 3-5 分钟），看到 5 个容器都 `healthy` 后：

打开浏览器 → **http://localhost:5000** → 自动跳转到登录页 → 用 `admin / admin@123` 登录 → 看到带演示数据的甘特图。

> 也可访问：
> - **API 文档**: http://localhost:5000/swagger
> - **健康检查**: http://localhost:5000/health

详细说明：[v1/README.md](v1/README.md) · 故障排查：[_docs/troubleshooting.md](_docs/troubleshooting.md)

---

## 截图

| 排程甘特图 | 生产看板 | SPC 质量图 |
|---|---|---|
| ![甘特图](_docs/screenshots/02-scheduling-gantt.png) | ![看板](_docs/screenshots/03-production-board.png) | ![SPC](_docs/screenshots/04-spc-chart.png) |

| 风险预警 | 设备状态 |
|---|---|
| ![RiskBoard](_docs/screenshots/05-riskboard.png) | ![设备](_docs/screenshots/06-equipment.png) |

---

## 技术栈

- **后端**：.NET 10 / ASP.NET Core 极简 API / EF Core / SignalR
- **前端**：Vue 3 / Vite / dhtmlx-gantt
- **数据**：PostgreSQL 16 / Redis 7 / RabbitMQ 3.13 / Qdrant 1.13
- **AI**：Microsoft.SemanticKernel / Microsoft.ML.OnnxRuntime
- **观测**：Serilog / OpenTelemetry（OTLP）
- **测试**：xUnit / FluentAssertions / Playwright E2E / BenchmarkDotNet

---

## 开源版 vs 商业版

| 模块 | 开源版（你正在看） | 商业版增量 |
|------|---|---|
| 排程引擎 | 确定性规则引擎 + 重排器 | LLM 局部精调 + Pareto Top-3 + 历史数据自学习 |
| 视觉质检 | ONNX 接口占位 | 完整模型推理 + 多模型版本管理 |
| 知识库 | 关键字检索 + 演示 RAG | Qdrant 向量检索 + 完整 Agent 编排 |
| 部署 | 单机 Docker Compose | K8s 集群 / 多租户 / 私有部署支持 |
| SLA | 社区支持（GitHub Issues） | 商业 SLA + 技术专家对接 |

完整边界对照：[`_docs/commercial-vs-opensource.md`](v1/_docs/commercial-vs-opensource.md)

---

## 文档

- [详细 Quickstart](v1/_docs/quickstart.md) — 先决条件 + 故障排查 + 第一次使用引导
- [架构概览](v1/_docs/_design/aimes-design-doc.v1.md) — 设计决策 / C4 视图 / 数据模型
- [开源 vs 商业版](v1/_docs/commercial-vs-opensource.md) — 功能边界 + 联系方式
- [Changelog](v1/CHANGELOG.md) — 发布记录

---

## 维护策略 & 贡献

AIMes 是**公司维护**的开源产品。我们投入资源持续迭代开源版，但**不依赖社区贡献**——所以：

- ✅ Bug 报告：欢迎用 GitHub Issues
- ✅ 功能建议：欢迎用 GitHub Discussions
- ⚠️  Pull Request：评估周期较长（通常 ≥ 2 周），优先合并修 bug、文档、本地化的 PR

如需企业支持、定制开发、私有部署，请通过商业渠道联系：见 [`commercial-vs-opensource.md`](v1/_docs/commercial-vs-opensource.md) 底部。

---

## License

[Apache License 2.0](LICENSE) · Copyright © 2026 AIMes Contributors
