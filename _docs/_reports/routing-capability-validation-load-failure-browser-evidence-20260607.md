# RoutingBoard 能力校验记录加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`RoutingBoard` 工艺能力校验历史记录读取失败时的 fail-loud 证据。
- 目标：后端 `/api/v1/scheduling/route-capability-validation/latest` 不可用时，真实浏览器必须明确告警，并保持 `R-B200` 热处理能力校验为待校验状态，避免使用不可信的历史校验结论。

## 发现

- 现有单元测试通过 mock `readRouteCapabilityValidationBackendFirst()` 抛错覆盖了 UI fail-loud 分支。
- 真实 HTTP 503 会先被 `getLatestRouteCapabilityValidation()` catch 成 `null`，再被 `readRouteCapabilityValidationBackendFirst()` 当成本地回退路径处理，导致真实浏览器无法触发 `能力校验记录加载失败`。
- 这是单元证据和真实浏览器证据不一致的产品缺口。

## 变更

- `src/frontend/src/api/engineeringEvidence.ts`
  - 为 `getLatestRouteCapabilityValidation()` 增加可选 `failLoud` 读取模式。
- `src/frontend/src/utils/engineering-change-sync.ts`
  - 为 `readRouteCapabilityValidationBackendFirst()` 增加可选 `failLoud` 读取模式。
  - 默认仍保持原有 best-effort 本地回退，避免影响排产页等既有调用。
- `src/frontend/src/components/routing/RoutingBoard.vue`
  - 读取能力校验历史时启用 `failLoud`，让后端失败进入页面已有 alert 分支。
- `src/frontend/tests/e2e/routing.spec.ts`
  - 新增真实 Chromium 用例：`能力校验记录加载失败时真实浏览器展示 fail-loud 且保持待校验`。
- `src/frontend/tests/unit/engineering-change-sync.test.ts`
  - 补充 helper fail-loud 单元回归，确保后端失败可被调用方感知。

## 验证

- `npm.cmd run test:unit -- tests/unit/engineering-change-sync.test.ts -t "throws route capability backend failures"`
  - Vitest 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/routing-board.test.ts -t "alerts without blocking the route list when capability validation history loading fails"`
  - Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "能力校验记录加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 真实 Chromium 拦截 `/api/v1/scheduling/route-capability-validation/latest` 返回 503。
- 页面展示 `能力校验记录加载失败`。
- 告警具备 `aria-live="assertive"`。
- 告警包含 `chromium route capability backend unavailable`。
- `R-B200` 能力校验状态保持 `待校验`，未误显示 `瓶颈已校验`。

## 结论

- `RoutingBoard` 能力校验历史失败路径已从“单元 mock 可见”推进到“真实 HTTP 失败可见”。
- 本片修复了真实浏览器下被 helper 吞错的 fail-loud 缺口，同时保留其他调用默认回退语义。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
