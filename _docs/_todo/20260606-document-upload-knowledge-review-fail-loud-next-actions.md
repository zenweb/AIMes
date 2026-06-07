# 2026-06-06 DocumentUpload 知识复核后续事项

## A 轨质量

- `DocumentUpload` 当前已知用户触发写入点已完成 fail-loud 扫描与补齐。
- 下一片建议按覆盖率杠杆选择新的用户必经低覆盖组件，而不是继续在 `LoginPage` 或已收敛的 `DocumentUpload` 里做低收益精修。
- 候选方向：重新跑覆盖率报告，按低覆盖 + 用户必经 + 业务关键度选择下一个组件。

## B 轨发布阻断

- GitHub hosted CI：仍需 GitHub repo/remote/run URL/run id/job summary。
- PostgreSQL/staging rehearsal：仍需 Docker 镜像源或预拉 PostgreSQL/Redis/RabbitMQ/Qdrant 镜像。
- Attack Chain A/B/C：仍需人工 verifier、VerifiedAt 和 dated evidence。
- Security signoff：仍需授权人员签字。
- Gray observation：仍需首次灰度后 14 calendar days P0/P1=0 证据。
