# Plan: ScheduleBoard 外协排产释放证据

日期：2026-06-06

## 成功标准

- `ScheduleBoard` 外协到货后采纳 Agent 建议的释放闭环有真实 Chromium 证据。
- 证据必须覆盖 UI、释放 trace、释放审计号、OTD 证据链写入。
- 不新增功能，不改变生产逻辑。
- 对未验证项 fail loud。

## 执行

- [x] 复用现有 ScheduleBoard 外协释放逻辑。
- [x] 在 `tests/e2e/scheduling.spec.ts` 增加模块内真实浏览器用例。
- [x] 定向运行真实 Chromium 验证。
- [x] 更新报告、changelog、review、todo、plan。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "外协到货建议"`：Chromium 1/1 passed。
- 既有 unit/coverage 证据：ScheduleBoard unit 21/21 passed，coverage 总套 555/555 passed。

## Stop Condition

- 本片 A 轨道证据已闭环。
- B 轨道外部发布闸门仍保持打开，不声明发布完成。
