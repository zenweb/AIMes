# 2026-06-05 Todo - Nuxt Build Deprecation Cleanup Next Actions

## Done

- [x] 把 Nuxt build 里的 Node deprecation warning 追到 `@vue/shared` 的包出口解析。
- [x] 在 `nuxt.config.ts` 中增加 `@vue/shared` 直文件 alias。
- [x] 将 `nuxt` 升到 `3.21.7`。
- [x] 复验 `npm run build`、`npm run lint` 和目标单测。

## Next

- [ ] 如需继续收尾，只剩 chunk size warning 的体积优化，不再是 deprecation 收口。
- [ ] 继续按 Sprint 0 / B-track 的主线，把真正的发布闸门证据单独追完。
