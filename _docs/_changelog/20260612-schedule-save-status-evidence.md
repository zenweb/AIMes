# 2026-06-12 排产拖拽保存状态证据

## 变更

- `ScheduleBoard` 在真实 dhtmlx 拖拽保存成功后显示独立的保存状态条。
- 状态条使用 `role="status"` 和 `aria-live="polite"`，内容包含工单号和保存后的开始/结束窗口。
- 保存失败、刷新排产数据或重新加载时会清空保存状态，避免误报已保存。
- live staging E2E 增加页面保存状态断言，并在刷新前新增状态截图。

## 证据

- `npm run test:unit -- tests/unit/schedule-board.test.ts`：26 passed。
- `npm run test:e2e -- --grep "真实 dhtmlx 拖拽保存"`：3 passed。
- `AIMES_RUN_LIVE_STAGING_E2E=true AIMES_LIVE_API_BASE_URL=http://localhost:5000 npm run test:e2e -- --grep "live staging"`：1 passed。
- 新截图：`output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-save-status.png`。
- 更新 manifest：`output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback-manifest.md`。

## 结果

- 排产页不再只依赖工作台反馈文案或 API/DB 证据证明保存完成；调度员在页面上能直接看到正式排产保存状态。
- 本片继续收敛现有排产关键路径，没有扩展新功能范围。
