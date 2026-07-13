# 2026-07-14 审计回放与双语复核

## 结果

审计日志核心页面已跟随全局 locale 切换。English 测试验证标题、筛选选项和详情按钮的上下文 ARIA 文案；中文既有错误、分页和精确 trace 回放测试保持通过。

## 证据

- 前端全量：119 个测试文件，1342 个用例通过。
- lint：`npm run lint` 通过，0 warnings。
- 后端精确回放：`AuditLogControllerTests` 1/1 通过。
- 严格发布门禁的唯一失败仍是外部 Gray observation，不受本次变更影响。
- PR #3 已合并到 `V1@48a3239`；V1 CI `29268658668` 和 Agent Evaluation `29268658661` 均成功，最终严格报告为 `_docs/_reports/release-gate-audit-20260714-v1-final.md`。

回放面板本批只迁移控制框架，不翻译动态审计正文，避免改变证据原文；新增 English 行为测试覆盖标题、回放命令、元信息标签、风险标签和审批标题。

PR #4 已合并到 `V1@3ef45fa`。最终 V1 CI `29271142661` 和 Agent Evaluation `29271142560` 均成功；其中 recovery 作业执行了证据契约测试、PostgreSQL 备份和隔离恢复。因此远端 CI 与备份恢复已有可追溯发布证据，当前严格门禁只应由真实 Gray observation 决定。

本轮复核补充了审计功能完整性：PATCH 可筛选，详情保留所有关键证据元数据并可按 Trace 回筛；通用写操作审计持久化业务键和请求 Trace；分页非法输入显式 400；回放指标不再宣称固定 100% 覆盖。前端、后端单测、集成、架构、lint 和 format 均通过，未发现本轮回归。

PR #5 首轮 CI 暴露前端 artifact 路径仍指向不存在的 `dist`，导致 Build 绿但没有上传发布制品。现已统一 CI 与 Docker 使用 static preset，并增加 `.output/public/index.html` 和 artifact 缺失硬失败；本地契约测试 3/3、静态构建及入口检查通过。

最终 CI 仍有官方 Actions Node 20 弃用注解。已按各官方仓库 2026-07-14 最新稳定主版本升级全部 workflow，并用前端 CI 契约与 Gray workflow 契约防止回退到 v4。
