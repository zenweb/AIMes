# AnomalyBoard 异常详情 Dialog 真实浏览器证据报告

日期：2026-06-06

## 范围

- B 轨短复核：确认当前 hosted CI/staging 是否可推进。
- A 轨道：精品化现有异常管理关键路径。
- 本片覆盖异常详情滑出面板作为命名 modal dialog 暴露，并保持 AI 分析入口可用。
- 未改变异常列表、详情加载、AI 分析 fallback、异常分流或跨模块联动业务逻辑。
- 未关闭发布 B 轨道闸门。

## B 轨复核

- `gh auth status`：已登录 `zenweb`，具备 `repo`、`workflow` 等 scope。
- `git remote -v`：当前 remote 仍为 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote，不能用 `gh run` 取得 GitHub Actions RunUrl/RunId。
- `docker version`：Docker Linux engine 可用，Client/Server 均为 29.5.2。
- `docker image ls`：未发现 staging rehearsal 依赖镜像 `postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest`。

## 变更

- `src/frontend/src/components/anomaly/AnomalyBoard.vue`
  - 异常详情 `.panel-content` 增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="anomaly-detail-title"`。
  - 详情标题增加 `id="anomaly-detail-title"`。
  - 关闭按钮增加 `aria-label="关闭异常详情"`。
- `src/frontend/tests/unit/anomaly-board.test.ts`
  - 新增 RED/GREEN 单测，覆盖异常详情命名 modal dialog 语义。
- `src/frontend/tests/e2e/anomaly.spec.ts`
  - `异常详情仍可打开 AI 分析建议` 真实 Chromium 用例改用 `getByRole('dialog', { name })` 验证详情面板，并验证关闭按钮可访问名。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "labelled modal dialog"`
  - 预期失败：找不到 `[role="dialog"]`。
- GREEN：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "labelled modal dialog"`
  - Vitest 1 file passed，目标用例通过。
- 真实浏览器：`npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常详情仍可打开 AI 分析建议"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- hosted CI 仍缺 GitHub remote/Actions RunUrl/RunId/job summary evidence。
- PostgreSQL/staging 仍缺依赖镜像或可用 registry/proxy，未通过 rehearsal。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口仍未关闭。
