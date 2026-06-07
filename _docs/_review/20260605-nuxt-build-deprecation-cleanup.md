# 2026-06-05 Review - Nuxt Build Deprecation Cleanup

## Findings

- 旧的 build deprecation warning 来源于 Nitro 生成模板对 `@vue/shared` 的包出口解析，而不是本仓库业务代码。
- 通过 alias 直指 `@vue/shared/dist/shared.esm-bundler.js` 后，build 里的 Node deprecation warning 消失。

## Verification

- `npm run build`：通过，只剩 bundle size 提示。
- `npm run lint`：通过。
- `npm run test:unit -- tests/unit/document-upload.test.ts`：15 passed。

## Residual Risk

- `npm run build` 仍有 chunk size warning；这是体积提示，不是 deprecation，也不影响当前发布闸门的真实性。
- 这不替代 B-track 的 hosted CI / staging / 安全签字 / 灰度观察证据。
