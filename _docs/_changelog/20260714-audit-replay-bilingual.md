# 2026-07-14 审计回放与双语补充

- `AuditLogBoard` 完成简体中文/English 页面级本地化，覆盖证据链说明、筛选、分页、详情、动作标签、ARIA 标签和错误状态。
- 保留 `auditId`/`traceId` 精确回放；补充独立 HTTP 集成测试验证 trace 只返回匹配记录。
- 本地验证：审计页聚焦 12/12，前端全量 119 文件/1342 用例，lint 通过，HTTP 集成测试 1/1 通过。
- PR #3 已合并到 `V1@48a3239`；最终 CI `29268658668` 与 Agent Evaluation `29268658661` 全部 PASS，backend 架构、开源 build/runtime、集成和 recovery 均通过。
- `AuditDecisionReplayPanel` 首屏回放控制框架接入双语 locale：标题、待审批状态、指导语、关联入口、对象/执行人/证据、回放命令、风险/留痕和审批区及 ARIA 文案已迁移；动态证据正文保持原始记录语言。
- 回放面板聚焦测试 `62/62`、前端全量 `119` 文件/`1343` 用例及 lint 通过。
- PR #4 已合并到 `V1@3ef45fa`；最终 CI `29271142661` 与 Agent Evaluation `29271142560` 全部 PASS，backend、frontend、security、container 和 PostgreSQL recovery 作业均通过。
- 新增最终托管 CI 证据 `_docs/_reports/hosted-ci-20260714-v1-3ef45fa-pass.md`，远端 CI 与备份恢复不再是发布阻断项。
- 严格门禁 `_docs/_reports/release-gate-audit-20260714-v1-final.md` 已重跑：Hosted CI、staging、backup/restore、Attack Chain、安全签核均 PASS，唯一失败为 Gray observation 的外部环境/14 天真实事故证据缺失。
- 审计列表补齐 PATCH 筛选与详情列标题，详情弹窗展示 initiatedBy、businessKey、traceId、promptHash、contextHash，并支持从 Trace 直接回筛。
- 通用写操作审计现在保存 `resource:id` business key 与 HTTP `TraceIdentifier`；非法分页在 API 层返回 400，`pageSize` 限制为 1..200，避免审计回放查询失真或过载。
- 回放指标移除虚假的固定 `100%` 覆盖率，改为实时证据链条数，并完成中英文指标标题本地化。
- 回归验证：前端 `119/1345`、后端单测 `475/475`、集成测试 `227/227`、架构测试 `130/130`、lint 和 `dotnet format --verify-no-changes` 全部通过。
- 修复 hosted CI 前端制品空上传：新增统一 `build:static`，CI、Docker 都生成 `.output/public/index.html`；artifact 路径改为真实 Nuxt 静态目录，并在入口或文件缺失时 fail loud。
- 清理 hosted CI Node 20 弃用注解：CI、Agent Evaluation、Gray Observation 升级到官方 Node 24 代际 Actions（checkout v7、setup-node v6、setup-dotnet v5、cache v6、upload-artifact v7），并补契约测试。
- 外部灰度观察仍需真实部署目标和 14 天事故证据，未将本次 UI/回放验证冒充灰度 PASS。
