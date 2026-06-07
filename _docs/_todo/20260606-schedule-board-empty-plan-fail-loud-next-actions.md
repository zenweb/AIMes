# 2026-06-06 ScheduleBoard 空排产计划后续事项

## A 轨质量

- 继续按“覆盖率增量 × 用户必经 × 业务关键度”选片，不继续精修已 100% 覆盖的 LoginPage。
- 下一个候选优先比较：`ChatPanel.vue`、`DocumentUpload.vue`、`AuditDecisionReplayPanel.vue`、`ScheduleBoard.vue`、`ReportBoard.vue`。
- ScheduleBoard 后续只处理高价值缺口：后端设备列表坏载荷、风险事件增强失败、拖拽保存失败的真实浏览器 fail-loud 路径。

## B 轨发布阻断

- GitHub hosted CI：需要 GitHub repo/remote/run URL/run id/job summary。
- PostgreSQL/staging rehearsal：需要 Docker 镜像源或预拉 `postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest`。
- Attack Chain A/B/C：需要人工 verifier、VerifiedAt 和 dated evidence。
- Security signoff：需要授权人员签字，Codex 不代签。
- Gray observation：需要首次灰度后 14 calendar days P0/P1=0 证据。
