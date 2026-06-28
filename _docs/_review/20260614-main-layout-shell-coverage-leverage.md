# 2026-06-14 Review - MainLayout 壳层覆盖率杠杆

## Findings
- `MainLayout` 是全站入口壳层，暗色模式和退出登录属于用户必经的可靠性边界。
- 原有测试只覆盖移动菜单 aria 状态，未覆盖本地偏好恢复和退出清理链路。
- 本片没有新增功能，只把现有行为写成可回归的测试证据。

## Verification
- 单文件单测：3 passed。
- 完整前端 coverage：105 files / 751 tests passed。
- `MainLayout.vue` lines 达到 88.23%，比当前基线报告里的 76.47% 有明显增量。

## Residual Risk
- 本片未跑真实浏览器截图，因为行为由组件状态和 store/router mock 可直接证明。
- 单文件 coverage 命令会因全局阈值误红，后续审计应以完整 `npm run test:unit:coverage` 为权威。
