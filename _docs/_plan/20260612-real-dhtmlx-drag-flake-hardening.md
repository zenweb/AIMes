# 2026-06-12 Plan：真实 dhtmlx 拖拽证据稳定化

## 目标

让“真实 dhtmlx 拖拽保存”组合 E2E 在首跑、无 retry 条件下稳定通过，并确保命令本身不会误跑轻量 demo marker。

## 执行

1. 复现失败：
   - 默认环境下真实 dhtmlx 任务条可能不存在。
   - 正确关闭 demo 后仍出现拖拽未触发 PATCH。
2. 收敛修复：
   - e2e wrapper 自动识别 `真实 dhtmlx` grep 并关闭 demo hints/offline demo。
   - 测试 helper 等待急单建议 active，再真实点击采纳。
   - 拖拽 helper 等 dhtmlx 内容层 bbox 稳定，从 `.gantt_task_content` 发起更长距离拖拽。
3. 验证：
   - 定向单测。
   - 无 retry 真实 dhtmlx E2E。
   - frontend lint。

## 停止条件

- `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存" --reporter=line --retries=0` 显示 `2 passed`，且不依赖手动环境变量。
- 相关单测与 lint 通过。

## 后续

- 继续排产页精品化，不把本片视为大目标完成。
