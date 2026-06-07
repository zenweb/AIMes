# 2026-06-05 前端真实浏览器证据下一步

## Done

- 已完成：用 Nuxt production build + Chrome Playwright 跑通 demo 截图链路。
- 已完成：用 Chrome Playwright 跑通 12 个用户必经模块渲染检查。
- 已完成：把结果落到 `_docs/_reports/frontend-real-browser-evidence-20260605.md`。

## Next

- 继续按覆盖率增量与用户必经度选择排产相关浏览器交互证据，不回头精修已高覆盖登录页。
- 为排产页补直接交互级证据：风险事件进入排产队列后，用户点击复核并看到 Agent 建议。
- 将超过 `900 kB` 的 Nuxt chunk 警告单独列为性能优化项，不混入当前浏览器证据切片。
