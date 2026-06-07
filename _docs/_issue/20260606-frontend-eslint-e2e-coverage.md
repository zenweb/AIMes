# 2026-06-06 Issue：tests/e2e 未纳入前端 ESLint Gate

## 现象

- 前端 `lint` 脚本只覆盖 `src`、`tests/unit` 和 `vitest.config.ts`。
- ESLint flat config 的 `files` 也未匹配 `tests/e2e/**/*.ts`。
- 直接 lint e2e 时出现 TypeScript parsing errors，说明 e2e 未使用 TypeScript parser。

## 影响

- 多份真实浏览器证据报告只能声明 e2e 已运行，不能声明 e2e lint passed。
- 发布审计中存在测试代码质量 gate 缺口。

## 处理

- 将 `tests/e2e/**/*.ts` 纳入 ESLint files。
- 将 `tests/e2e` 纳入 `npm run lint`。
- 清理 e2e 目录 3 个 lint warning。
- 验证 e2e lint 和完整前端 lint 均通过。

## 状态

- A 轨道工具链缺口已处理并验证。
- B 轨道发布闸门仍未关闭。
