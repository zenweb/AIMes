# Frontend ESLint e2e 覆盖真实证据报告

日期：2026-06-06

## 范围

- A 轨道 / 工具链审计：关闭此前多份报告反复暴露的 `tests/e2e/**/*.ts` 未纳入 ESLint 覆盖缺口。
- 本片只修改 lint 覆盖配置和 3 个 e2e lint warning。
- 未改变业务组件、真实浏览器流程或测试断言语义。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/eslint.config.cjs`
  - ESLint flat config 的 `files` 增加 `tests/e2e/**/*.ts`，确保 e2e 使用 TypeScript parser 和同一规则集。
- `src/frontend/package.json`
  - `lint` 脚本从 `eslint src tests/unit vitest.config.ts ...` 扩展为 `eslint src tests/unit tests/e2e vitest.config.ts ...`。
- `src/frontend/tests/e2e/demo-asset-capture.spec.ts`
  - 删除未使用的 `expectedPValue`。
- `src/frontend/tests/e2e/knowledge.spec.ts`
  - 用 `QualityKnowledgeRetrainingVersionRecord` 替换 `any`。
- `src/frontend/tests/e2e/risk.spec.ts`
  - 用 `RiskActionTrace` 替换 `any`。

## 验证

- 评估 RED：`npx.cmd eslint tests/e2e --ext .ts --max-warnings 0`
  - 配置修复前失败：15 个 TypeScript parsing errors，说明 e2e 未被 TypeScript parser 覆盖。
- 配置后第一次验证：`npx.cmd eslint tests/e2e --ext .ts --max-warnings 0`
  - Parsing errors 消失，仅剩 3 个 warning。
- GREEN：`npx.cmd eslint tests/e2e --ext .ts --max-warnings 0`
  - 通过，无输出。
- 完整验证：`npm.cmd run lint`
  - 通过；脚本输出确认覆盖 `eslint src tests/unit tests/e2e vitest.config.ts --ext .ts,.vue --max-warnings 0`。

## 未通过/未覆盖项

- 本片只关闭前端 e2e lint 覆盖缺口。
- hosted CI 仍缺 GitHub remote/Actions RunUrl/RunId/job summary evidence。
- PostgreSQL/staging 仍缺依赖镜像或可用 registry/proxy，未通过 rehearsal。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口仍未关闭。
