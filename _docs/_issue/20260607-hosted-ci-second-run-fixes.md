# Issue: Hosted CI second run exposed CI-only failures

## 状态

已定位并本地修复。等待提交、push 后用新的 GitHub Actions run 验证。

## 证据

- CI run `27085506748`:
  - frontend `Install dependencies` failed: npm 10 `npm ci` reported lockfile out of sync.
  - backend `Integration Tests` failed: Auth tests returned 500 and `/health` returned 503.
- Agent Evaluation run `27085506747`: success.

## 影响

Hosted CI release gate 仍为 FAIL。旧 workflow root path 问题已解决，但必须取得新 CI success run 才能关闭门禁。

## 修复

- `src/frontend/package-lock.json` 使用 npm 10 重新对齐。
- 集成测试工厂显式覆盖测试配置：
  - `ConnectionStrings:Redis` 为空。
  - `ConnectionStrings:RabbitMQ` 为空。
  - `Messaging:Transport` 为 `Disabled`。
  - `AI:VectorStore:Provider` 为 `InMemory`。
