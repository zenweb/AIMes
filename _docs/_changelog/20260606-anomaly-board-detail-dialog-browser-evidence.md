# 2026-06-06 AnomalyBoard 异常详情 Dialog 真实浏览器证据

## Changed

- 异常详情滑出面板现在作为命名 `dialog` 暴露，并设置 `aria-modal="true"`。
- 异常详情关闭按钮增加明确可访问名称 `关闭异常详情`。
- 真实 Chromium 异常详情用例现在通过 `getByRole('dialog', { name })` 验证面板。

## Tests

- `npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "labelled modal dialog"`：1 file passed，目标用例通过。
- `npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常详情仍可打开 AI 分析建议"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- B 轨短复核显示 GitHub Actions evidence 和 staging rehearsal 仍未关闭。
- 本片不改变异常管理业务逻辑。
