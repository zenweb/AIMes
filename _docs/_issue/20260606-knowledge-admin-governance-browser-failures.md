# Issue: Knowledge e2e Admin 治理证据断点

## 现象

`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts` 当前失败 2 个真实 Chromium 用例：

- `R3 调整范围重开校验后可重新灰度发布并恢复推荐决策`
  - Admin Agent 治理页等待 `回滚到 R2` 按钮超时。
  - 页面快照显示质量推荐灰度监控为 `0 条`。
- `R5 回滚后的 R6 补样和 R7 影子验证进入知识资产执行链`
  - Admin Agent 治理页找不到 `补样已合并`。
  - 页面快照显示质量实验候选为 `0 条`。

## 当前判断

Knowledge 页面内的质量知识资产操作已发生，但跳转到 Admin 治理页后相关质量灰度/实验候选证据没有进入 Admin 面板读取结果。

## 影响

不能声明整份 Knowledge 真实浏览器套件全绿，也不能把质量知识灰度/实验候选跨模块治理链路视为发布级证据。

## 下一步

定位 Admin 治理面读取质量知识证据的来源与 `DocumentUpload` 写入键是否一致，并用真实 Chromium 复跑确认。

## 2026-06-06 更新

已定位根因：`AdminBoard` 初始化时多个 backend-first 治理证据源顺序读取，早期证据源失败且无本地 fallback 时会中断后续加载，导致质量知识灰度/实验候选证据没有进入 Admin 面板。

已修复：新增逐项证据加载隔离，单项失败时页面 fail-loud，其他可用证据继续加载。

定向验证通过：

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R3 调整范围|R5 回滚后的 R6"`
- Chromium: 2/2 passed.
- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "知识复核写入失败|R3 调整范围|R5 回滚后的 R6"`
- Chromium: 3/3 passed.

全量状态已关闭：

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts`
- Production Nuxt build completed.
- Chromium: 15/15 passed.

本 issue 对应的 Knowledge -> Admin 治理证据断点已关闭。发布级 B 轨闸门另行追踪。
