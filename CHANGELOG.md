# Changelog

本文件记录 AIMes 面向用户的发布变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

> 内部开发日记请见 `_docs/_changelog/`，不在本文件追溯。

## [Unreleased]

### Added
- Pre-Launch DX 配套：根 README、v1 README、LICENSE、CHANGELOG、商业版 CTA 落地页
- `MES.Api` 启动横幅：打印登录 URL / 默认账号 / Swagger 入口 / 商业版指引
- 根路径 `/` 自动跳转到 `/scheduling/`，消除评估人猜路径摩擦
- `Aimes:EnableSwagger` 配置：允许 Production 模式下显式启用 Swagger UI（开源演示场景）
- `Aimes:DisableHttpsRedirect` 配置：允许在 docker-compose 等纯 HTTP 场景关闭 HTTPS 重定向

### Fixed
- `OnnxInferenceService.LoadModelAsync` 类型不匹配编译错误，改为 `async/await` 写法
- `OnnxInferenceService.GetOrLoadModelAsync` 增加 `ct.ThrowIfCancellationRequested()`，让所有调用路径在阻塞模型加载前响应取消

## [v0.1.0] - 2026-05-14

> **首次开源发布**。Phase 1 + 部分 Phase 2 切片，开源版功能边界已冻结。

### Added — 排程引擎
- 规则引擎：EDD / SPT / WSPT + 最小负载 + 约束验证
- 重排器：插单 / 故障 / 锁定支持
- LLM 混合精调（v2.1.0-hybrid，需 `Aimes:LlmEnabled=true`）
- 多目标优化：DueDate / Utilization / Changeover / Balanced 4 个 `IObjectiveFunction` 实现

### Added — 前端
- dhtmlx-gantt 排程甘特图：设备分组、瓶颈高亮、冲突闪烁、拖拽调整
- 生产概览仪表盘 + 路由重构
- RiskBoard 风险预警看板（工单延期 / 设备故障 / 物料齐套 / 产能瓶颈）
- 全模块业务看板：质量 / 设备 / 异常 / 库存 / 采购 / 人员

### Added — 业务模块
- 质量管理：SPC 图、质检记录、规则告警
- 设备管理：状态跟踪、维护记录、健康分
- BOM / 工艺路线：多级 BOM、工艺路线定义、变更管理
- 异常管理：上报、分级、响应流
- 库存 / 采购：库存台账、出入库、采购订单
- 人员管理：员工档案、岗位
- 知识库：文档上传 + 关键字检索 + 演示 RAG 问答
- 审计日志：操作追踪、JSON diff、IP/UA 记录
- 条码打印：QR 码批量打印、筛选搜索

### Added — 平台能力
- AI 决策可追溯：`AiDecisionTrace`（model/prompt hash + context hash + input/output summary + 业务键）
- 实时通知：SignalR + 6 类通知（设备 / 质量 / 生产 / 异常 / 库存 / 采购）+ 前端 Toast
- 演示降级：所有看板内置「后端不可用 → 演示数据」分支
- 采纳反馈：`ScheduleAdoptionFeedback` 领域实体 + `AdoptionFeedbackService`

### Added — 基础设施
- ASP.NET Core 极简 API（Swagger 按版本分组）
- EF Core + PostgreSQL
- SignalR + Redis
- MassTransit + RabbitMQ
- Qdrant 向量库（商业版用）
- Serilog + OpenTelemetry（OTLP exporter）
- Docker Compose 一键启动
- GitHub Actions CI（restore + build + format check + 测试）

### Security
- JWT 认证 + 4 角色（Operator / Lead / Engineer / Admin）
- Refresh Token 轮转 + Token 黑名单
- 登录接口固定窗口速率限制（10 req/min/IP）
- 全局 ProblemDetails 错误响应（RFC 7807）

### Tests
- 152 单元测试 + 45 集成测试 + Playwright E2E + BenchmarkDotNet 性能基准

### Known Limitations（开源版边界）
- AI 排程仅含确定性规则引擎；LLM 多目标 Pareto / 自学习需商业版
- ONNX 视觉质检仅占位；完整模型推理 + 模型版本管理需商业版
- 单机部署优先，集群 / 多租户需商业版

详见 [`_docs/commercial-vs-opensource.md`](_docs/commercial-vs-opensource.md)。

[Unreleased]: https://github.com/YOUR_ORG/aimes/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/YOUR_ORG/aimes/releases/tag/v0.1.0
