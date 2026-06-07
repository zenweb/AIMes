# 2026-06-06 Frontend ESLint e2e 覆盖 Plan

## 成功标准

- ESLint 配置明确覆盖 `tests/e2e/**/*.ts`。
- `npm run lint` 脚本明确覆盖 `tests/e2e`。
- `npx eslint tests/e2e --ext .ts --max-warnings 0` 通过。
- `npm run lint` 通过。

## 执行

1. 读取 `eslint.config.cjs` 和 `package.json`，确认 e2e 未覆盖。
2. 运行 e2e lint 评估失败规模。
3. 修 ESLint files 范围和 npm lint 脚本。
4. 清理 3 个 e2e lint warning。
5. 验证 e2e lint 和完整前端 lint。
6. 更新报告、changelog、review、todo、issue、plan。

## 结果

- e2e lint 缺口已关闭。
- 完整前端 lint 已通过。
- B 轨道发布闸门未纳入本片完成标准。
