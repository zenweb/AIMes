# Todo - Nuxt Dev Rollup Input Hang Next Actions

- Reproduce with a minimal Nuxt 3.21 SPA config plus the current `vite.build.rollupOptions` shape.
- Confirm whether Nuxt merges user `rollupOptions` after generated client/server inputs in dev mode.
- Test a targeted fix in an isolated branch/worktree before touching main frontend config.
- Keep using `npm run build` + preview for acceptance evidence until dev mode is proven green.
