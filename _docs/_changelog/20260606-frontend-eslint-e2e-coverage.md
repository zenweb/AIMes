# 2026-06-06 Frontend ESLint e2e 覆盖

## Changed

- `npm run lint` 现在覆盖 `tests/e2e`。
- ESLint flat config 现在对 `tests/e2e/**/*.ts` 使用 TypeScript parser。
- 清理 3 个 e2e lint warning：1 个未使用变量，2 个 `any` 类型。

## Tests

- `npx.cmd eslint tests/e2e --ext .ts --max-warnings 0`：通过。
- `npm.cmd run lint`：通过，并覆盖 `src tests/unit tests/e2e vitest.config.ts`。

## Notes

- 此后可以声明 e2e lint 已由前端 lint 脚本覆盖。
- B 轨道发布闸门仍未关闭。
