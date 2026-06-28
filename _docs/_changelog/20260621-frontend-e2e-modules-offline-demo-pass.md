# 2026-06-21 Frontend E2E Modules Offline Demo Pass

- 复跑 `tests/e2e/modules.spec.ts`，全模块离线 demo smoke 12/12 通过。
- 覆盖主要模块入口在 `?offlineDemo=1` 下不暴露 backend skip、HTML fallback、请求错误和加载失败文案。
- 将该切片作为真实浏览器入口 clean sweep 的当前基线证据。
