# 2026-06-07 Review - RoutingBoard 能力校验记录加载失败 Chromium 证据

## 审计结论

通过。`RoutingBoard` 能力校验历史记录后端失败路径已补齐真实 Chromium 证据，并修复了真实 HTTP 503 被读取 helper 吞掉导致页面无法 fail-loud 的缺口。

## 证据

- 新增用例位置：`src/frontend/tests/e2e/routing.spec.ts`
- 用例名：`能力校验记录加载失败时真实浏览器展示 fail-loud 且保持待校验`
- 生产修复：
  - `src/frontend/src/api/engineeringEvidence.ts`
  - `src/frontend/src/utils/engineering-change-sync.ts`
  - `src/frontend/src/components/routing/RoutingBoard.vue`
- 验证命令：

```powershell
npm.cmd run test:unit -- tests/unit/engineering-change-sync.test.ts -t "throws route capability backend failures"
npm.cmd run test:unit -- tests/unit/routing-board.test.ts -t "alerts without blocking the route list when capability validation history loading fails"
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "能力校验记录加载失败"
```

结果：两个 Vitest 定向用例通过，Chromium `1 passed`。

## 风险与边界

- 本轮只跑能力校验记录加载失败目标切片，未全量回归所有 RoutingBoard e2e。
- `failLoud` 只在 RoutingBoard 能力校验历史读取中启用，其他 backend-first 调用仍保持原有 best-effort 回退。
- B 轨发布闸门仍未关闭，不能把此 A 轨证据等同于 v1.0.0 发布就绪。
