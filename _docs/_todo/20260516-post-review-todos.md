# 20260516 — All-of-Solution Review 后续 TODO（已全部清空）

> **状态：全部完成 ✅** — 详见 `_docs/_changelog/20260516-p2-all-resolved-codex-round3.md`
> **最终验证**：264 单元测试全过；默认构建 + 开源构建（`/p:AimesOpenSource=true`）双 mode 0 警告 0 错误
>
> 本文件保留为审计档，记录每一项 P2 的来龙去脉 + 最终修复方式。

---

## 修复对账

| 项 | 严重 | 修复 commit | 备注 |
|---|---|---|---|
| **P1-2** TokenBlacklist + SigningKey 持久化 | P1 | (见 commit) | TokenBlacklist 改 IDistributedCache（自动 Redis 切换）；MinBlacklistTtl 修 ClockSkew 竞争；SigningKey rotation 暂不动（admin-rare） |
| **P1-6** 前端 axios 双拦截器 + refresh 流程 | P1 | `a0d7197` (上轮已修) | 401 → /auth/refresh → retry，并发共享 promise |
| **P0-2** RowVersion via xmin | P0 | (见 commit) | Npgsql 9.0.0 约定 + xid + ValueGeneratedOnAddOrUpdate；4 + 3 个 Aggregate |
| **P2-1** EF Migrations 单源 | P2 | (见 commit) | 删 db/init.sql；docker-compose 不再挂载；db/README.md 改用 `dotnet ef migrations script` |
| **P2-2** Pro/Core 隔离 | P2 | (见 commit) | MSBuild `<Compile Remove>` + `#if !AIMES_OPEN_SOURCE`，比物理分包简 10 倍 |
| **P2-3** IVectorStoreService + ct | P2 | (见 commit) | 4 方法 + ct，2 实现传播 |
| **P2-4** AdoptionFeedbackService 重复注册 | P2 | (见 commit) | 删 ServiceCollectionExtensions:194 的 Transient |
| **P2-5** 测试覆盖第 1 批 | P2 | (见 commit) | +25 测试（VO 等值/Hash + OperationExecution 状态机），239 → 264 |
| **P2-7** IUnitOfWork lambda 模式 | P2 | (见 commit) | 重写 ExecuteAsync(Func) + IExecutionStrategy；重启 EnableRetryOnFailure |

---

## 三轮 Codex 评审最终账本

```
原 review:    18 项（11 已修 + 7 推 P2 → 现已全修）
Codex 1 轮:   +6 项（5 全修 + 1 推 P2-7 → 现已修）
Codex 2 轮:   +1 项（健康检查空串守卫）已修
Codex 3 轮:   +1 项（Token blacklist ClockSkew 竞争）已修
─────────────────────────────────────────
总计:         26 项 — 100% 修复 ✅
```

---

## Push 前剩余事项（不在 review/codex 范围）

下列是**产品级**而非代码级，不属于本份 TODO：

1. 搬到 Docker 机器跑 `_docs/_todo/20260515-pre-launch-remaining.md` 9 步实测流程
2. 5 张产品截图就位（`_docs/screenshots/`）
3. `commercial-vs-opensource.md` 底部联系方式占位替换
4. 私仓 push 试运行 + 评估人视角自检
5. 公开 push + 自媒体文章联动 + git tag v0.1.0

---

## 关联文档

- 完整 review plan：`C:\Users\陈奕铭\.claude\plans\all-of-solution-curried-wave.md`
- 第 1 轮 review 修复：`_docs/_changelog/20260516-all-of-solution-review-fixes.md`
- 第 1 轮 Codex outside voice：`_docs/_changelog/20260516-codex-outside-voice-fixes.md`
- 第 2 轮 Codex 验证：`_docs/_changelog/20260516-codex-second-round.md`
- P1-6 前端 refresh 流程：`_docs/_changelog/20260516-p1-6-axios-refresh-flow.md`
- 第 3 轮 P2 全清 + Codex：`_docs/_changelog/20260516-p2-all-resolved-codex-round3.md`
- Push 前剩余产品级 TODO：`_docs/_todo/20260515-pre-launch-remaining.md`
