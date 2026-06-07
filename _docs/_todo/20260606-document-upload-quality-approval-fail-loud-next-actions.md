# 2026-06-06 DocumentUpload 后续事项

## A 轨质量

- 继续按覆盖率和用户关键度推进既有功能精品化。
- DocumentUpload 下一批高价值缺口：
  - 质量再训练校验写入失败 fail-loud。
  - 下一训练集审批/校验写入失败 fail-loud。
  - 实验候选合并/影子验证写入失败 fail-loud。
  - 客户工单导入生成失败 fail-loud。
- 不继续精修已 100% line coverage 的 LoginPage，除非出现真实生产风险。

## B 轨发布阻断

- GitHub hosted CI：仍需 GitHub repo/remote/run URL/run id/job summary。
- PostgreSQL/staging rehearsal：仍需 Docker 镜像源或预拉 PostgreSQL/Redis/RabbitMQ/Qdrant 镜像。
- Attack Chain A/B/C：仍需人工 verifier、VerifiedAt 和 dated evidence。
- Security signoff：仍需授权人员签字。
- Gray observation：仍需首次灰度后 14 calendar days P0/P1=0 证据。
