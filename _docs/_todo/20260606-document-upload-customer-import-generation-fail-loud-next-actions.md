# 2026-06-06 DocumentUpload 客户工单导入生成后续事项

## A 轨质量

- 重新扫描 DocumentUpload 剩余用户触发动作，确认是否仍有未包 fail-loud 的同步写入点。
- 继续按覆盖率增量与用户必经路径选择下一片，不回头精修已 100% 行覆盖的 LoginPage。

## B 轨发布阻断

- GitHub hosted CI：仍需 GitHub repo/remote/run URL/run id/job summary。
- PostgreSQL/staging rehearsal：仍需 Docker 镜像源或预拉 PostgreSQL/Redis/RabbitMQ/Qdrant 镜像。
- Attack Chain A/B/C：仍需人工 verifier、VerifiedAt 和 dated evidence。
- Security signoff：仍需授权人员签字。
- Gray observation：仍需首次灰度后 14 calendar days P0/P1=0 证据。
