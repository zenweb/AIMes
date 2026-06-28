# 2026-06-14 Issue - live staging 拖拽证据初次失败

## Problem
- `scheduling-live-staging.spec.ts` 的真实 dhtmlx 拖拽保存用例初次失败。
- 现象是任务条可见，但没有触发 PATCH 保存请求。

## Root Cause
- live staging 种子计划结束窗口过短，拖拽后任务容易越出计划边界，被 dhtmlx 限制回弹。
- 重试时未重新对齐视口，第二次拖拽更容易把鼠标带到视口外。

## Resolution
- 把 seed 的计划结束时间放宽到 `now + 72h`。
- 每次拖拽重试前重新 `scrollIntoViewIfNeeded()`。
- 清理 route 收尾，避免 page 关闭后的 in-flight 请求报错。
