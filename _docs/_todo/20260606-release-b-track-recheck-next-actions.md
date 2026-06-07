# 2026-06-06 B 轨发布闸门复检 Next Actions

## 需要用户/外部状态处理

- GitHub：为当前 repo 配置 GitHub remote，或提供实际 Actions run 的 `RunUrl`、`RunId`、job summary evidence。
- Docker：在 Docker Desktop 中配置可用 HTTPS proxy/registry mirror，或预拉：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 安全：完成人工 Attack Chain A/B/C 验证，填写 verifier、VerifiedAt 和 evidence。
- 签字：Attack Chain 通过后再签 Security signoff。
- 灰度：首次 gray release 后等待 14 calendar days，P0/P1=0 才能关闭。

## Codex 可继续推进

- 继续 A 轨精品化现有关键路径，但必须明确不能替代 B 轨。
- 或继续增强 B 轨脚本诊断、文档模板、自动化验证支持，但不得伪造人工/时间窗证据。
