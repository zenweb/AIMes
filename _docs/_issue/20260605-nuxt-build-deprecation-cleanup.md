# 2026-06-05 Issue - Nuxt Build Deprecation Cleanup

## Problem

`npm run build` 会输出 Node `DEP0155` deprecation warning，指向 `@vue/shared` 的包出口解析。它污染 CI 和本地构建日志，容易掩盖真正的失败信号。

## Root Cause

`@nuxt/nitro-server/dist/runtime/templates/error-500.mjs` 直接导入 `@vue/shared`，Node 在解析包出口时触发 deprecated trailing slash pattern mapping warning。

## Fix

- 在 Nuxt 配置中将 `@vue/shared` alias 到直文件路径 `node_modules/@vue/shared/dist/shared.esm-bundler.js`。
- 将 `nuxt` 从 `3.21.6` 升到 `3.21.7`，避免锁在旧 patch 上。

## Status

- 已修复；当前 build 只剩 chunk size 提示。
