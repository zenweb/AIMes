# AdminBoard Agent 配置审批 fail-loud

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/admin/AdminBoard.vue`
- 测试：`src/frontend/tests/unit/admin-board.test.ts`
- 路径：系统管理 -> Agent 治理 -> 关键配置变更审批 -> 通过/驳回

## 问题

关键配置审批写入调用缺少失败处理。`decideAgentConfigApproval(...)` 或审批列表刷新失败时，页面没有明确的管理员提示，失败会落入未处理 promise/异常路径。

该路径属于 Agent 治理和质量实验扩大门禁，不能静默失败。

## 修改

- 为 `handleApprovalDecision` 增加 fail-loud 处理。
- 审批写入失败时：
  - 不刷新审批列表。
  - 不乐观修改审批状态。
  - 通过页面 `role="alert"` 提示 `关键配置审批失败` 和后端/存储错误原因。
- 审批写入成功但刷新失败时：
  - 提示 `关键配置审批已写入，但审批列表刷新失败`。

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

- 11/11 passed。

回归：

```powershell
npm.cmd run test:unit:coverage
```

- 84/84 test files passed。
- 527/527 tests passed。
- 全局覆盖率：statements 74.68%，branches 58.64%，functions 69.06%，lines 78.08%。
- `AdminBoard.vue` 覆盖率：statements 75.38%，branches 34.00%，functions 43.47%，lines 78.54%。

真实浏览器：

```powershell
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- Nuxt production build 成功。
- Chromium：30/30 passed。
- 最大 JS chunk：817.50 kB。

## 发布闸门

本报告只关闭 A 轨的一个 Agent 治理质量缺口。Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天 P0/P1 观察窗口仍未关闭。
