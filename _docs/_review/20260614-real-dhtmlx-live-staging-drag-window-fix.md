# 2026-06-14 Review - 真实 dhtmlx live staging 拖拽窗口修正

## Findings
- 失败根因不在业务代码，而在 live staging E2E 种子窗口太短。
- 计划结束时间只到当前时间 +23h，拖拽 4 小时任务后容易撞上 `limit_move/limit_drag` 限制，导致不会触发 PATCH。
- 另外，拖拽重试时坐标对齐不稳，第二次尝试容易把鼠标带到视口外。

## Verification
- live staging 单文件稳定通过：2 passed。
- 之前的首次失败已消失，且不再留下 route 关闭时的未收尾报错。

## Residual Risk
- 这是测试证据层修正，不代表灰度观察已完成。
- 灰度 15 天观察按 owner 指示保持后置。
