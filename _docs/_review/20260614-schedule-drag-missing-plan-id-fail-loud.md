# 2026-06-14 Review - 排产拖拽缺少计划 ID Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 拖拽保存遇到缺少排产计划 ID 时已经从静默失败改为可见 alert。
- 成功拖拽保存、后端保存失败、刷新读回等既有真实浏览器路径仍通过。

## 关注点
- 覆盖率总行数变化后全局 lines 为 83.23%，低于上一片 83.25%，但完整测试通过；本轮重点是补正式写回静默失败证据，不包装成覆盖率增长。
- 真实浏览器用例通过后端返回空 `id` 的正式 dhtmlx 载荷覆盖数据异常，不依赖组件 mock。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `schedule-board.test.ts`：33 passed。
- `scheduling.spec.ts --project=chromium`：46 passed。
- `test:unit:coverage`：105 files / 702 tests passed，lines 83.23%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
