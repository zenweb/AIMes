# AdminBoard 质量灰度决策 fail-loud

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/admin/AdminBoard.vue`
- 测试：`src/frontend/tests/unit/admin-board.test.ts`
- 路径：系统管理 -> Agent 治理 -> 质量推荐灰度监控 -> 扩大灰度

## 问题

质量推荐灰度监控的扩大/回滚决策写入缺少失败处理。`decideQualityKnowledgeGrayRelease(...)` 抛错时，页面会进入 Vue native event handler 未处理异常路径，没有管理员可见告警。

该路径会影响 R3 灰度是否扩大或回滚，属于 Agent 治理发布质量路径，不能静默失败。

## 修改

- 为 `handleGrayReleaseDecision` 增加 fail-loud 处理。
- 决策写入失败时：
  - 不刷新灰度决策列表。
  - 不刷新 OTD 证据链。
  - 通过页面 `role="alert"` 提示 `质量推荐灰度决策失败` 和失败原因。
- 决策写入成功但刷新失败时：
  - 提示 `质量推荐灰度决策已写入，但灰度决策列表刷新失败`。

## 验证

RED：

```powershell
npm.cmd run test:unit -- tests/unit/admin-board.test.ts
```

- 新增用例先失败。
- 失败证据：Vue native event handler 出现未处理错误，页面没有 `[role="alert"]`。

GREEN：

```powershell
npm.cmd run test:unit -- tests/unit/admin-board.test.ts
```

- 12/12 passed。

回归：

```powershell
npm.cmd run test:unit:coverage
```

- 84/84 test files passed。
- 528/528 tests passed。
- 全局覆盖率：statements 74.72%，branches 58.73%，functions 69.25%，lines 78.11%。
- `AdminBoard.vue` 覆盖率：statements 75.92%，branches 35.38%，functions 46.58%，lines 79.12%。

真实浏览器：

```powershell
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- Nuxt production build 成功。
- Chromium：30/30 passed。
- 覆盖 Admin Agent 治理、质量灰度扩大/回滚、负样本关闭、重开校验和关键配置审批。
- 最大 JS chunk：817.50 kB。

## 发布闸门

本报告只关闭 A 轨的一个 Admin Agent 治理质量缺口。Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天 P0/P1 观察窗口仍未关闭。
