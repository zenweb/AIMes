# AdminBoard 质量灰度复核问题单关闭 fail-loud

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/admin/AdminBoard.vue`
- 测试：`src/frontend/tests/unit/admin-board.test.ts`
- 路径：系统管理 -> Agent 治理 -> 质量推荐灰度监控 -> 补充负样本并关闭

## 问题

R3 灰度回滚后的复核问题单关闭写入缺少失败处理。`closeQualityKnowledgeGrayReviewIssueWithNegativeSample(...)` 抛错时，页面会进入 Vue native event handler 未处理异常路径，没有管理员可见告警。

该路径负责把回滚后的负样本补充证据闭环到 Agent 治理，失败不能静默，也不能让管理员误以为问题单已经关闭。

## 修改

- 为 `closeGrayReviewIssueWithNegativeSample` 增加 fail-loud 处理。
- 问题单关闭写入失败时：
  - 不刷新灰度决策列表。
  - 不刷新 OTD 证据链。
  - 通过页面 `role="alert"` 提示 `质量灰度复核问题单关闭失败` 和失败原因。
- 问题单关闭写入成功但刷新失败时：
  - 提示 `质量灰度复核问题单已关闭，但灰度决策列表刷新失败`。

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

- 14/14 passed。

回归：

```powershell
npm.cmd run test:unit:coverage
```

- 84/84 test files passed。
- 530/530 tests passed。
- 全局覆盖率：statements 74.75%，branches 58.89%，functions 69.52%，lines 78.13%。
- `AdminBoard.vue` 覆盖率：statements 76.51%，branches 37.64%，functions 50.93%，lines 79.38%。

真实浏览器：

```powershell
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- Nuxt production build 成功。
- Chromium：30/30 passed。
- 覆盖 Admin Agent 治理、R3 回滚后补充负样本并关闭待复核问题单、重开校验和关键配置审批。
- 最大 JS chunk：817.50 kB。

## 发布闸门

本报告只关闭 A 轨的一个 Admin Agent 治理质量缺口。Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天 P0/P1 观察窗口仍未关闭。
