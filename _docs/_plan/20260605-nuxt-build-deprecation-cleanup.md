# 2026-06-05 Plan - Nuxt Build Deprecation Cleanup

## Success Criteria

- `npm run build` 不再输出 Node deprecation warning。
- `npm run lint` 继续通过。
- 目标单测继续通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：`nuxt.config.ts` 增加 `@vue/shared` alias。
- 已完成：`nuxt` patch 升级到 `3.21.7`。
- 已完成：`npm run build` 复验，不再输出 deprecation warning。
- 已完成：`npm run lint` 通过。
- 已完成：`npm run test:unit -- tests/unit/document-upload.test.ts` 通过。

## Boundary

- 只收口构建日志噪音，不关闭 hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
