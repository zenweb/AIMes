# 2026-06-05 Nuxt Build Deprecation Cleanup Changelog

## Change

- 选片依据：前端 build 仍输出 Node `DEP0155` deprecation warning，来自 Nuxt Nitro server 对 `@vue/shared` 的包出口解析；这会污染构建日志，但不影响功能。
- 修复：在 `nuxt.config.ts` 中把 `@vue/shared` alias 到 `node_modules/@vue/shared/dist/shared.esm-bundler.js`，避免 Node 再走包出口解析触发 deprecation。
- 顺手收口：`nuxt` 从 `3.21.6` 升到 `3.21.7`，保持当前 patch 线最新。

## Validation

- `npm run build`：通过；不再输出 `DEP0155` / `DEP0180` 类 deprecation warning，只剩 chunk size 提示。
- `npm run lint`：通过。
- `npm run test:unit -- tests/unit/document-upload.test.ts`：15 passed。

## Release Boundary

- 这只是构建日志噪音收口，不关闭 hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察闸门。
