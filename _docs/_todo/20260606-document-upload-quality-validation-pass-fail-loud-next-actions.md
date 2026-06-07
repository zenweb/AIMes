# 2026-06-06 DocumentUpload 质量知识发布前校验通过后续事项

## A 轨质量

- 继续收敛 DocumentUpload 知识治理链，不急着切到新功能。
- 下一批优先候选：
  - 下一训练集审批/校验写入失败 fail-loud。
  - 实验候选合并/影子验证写入失败 fail-loud。
  - 客户工单导入生成失败 fail-loud。
- 继续避免精修已高覆盖且非当前瓶颈的 LoginPage。

## B 轨发布阻断

- GitHub hosted CI：仍需 GitHub repo/remote/run URL/run id/job summary。
- PostgreSQL/staging rehearsal：仍需 Docker 镜像源或预拉 PostgreSQL/Redis/RabbitMQ/Qdrant 镜像。
- Attack Chain A/B/C：仍需人工 verifier、VerifiedAt 和 dated evidence。
- Security signoff：仍需授权人员签字。
- Gray observation：仍需首次灰度后 14 calendar days P0/P1=0 证据。
