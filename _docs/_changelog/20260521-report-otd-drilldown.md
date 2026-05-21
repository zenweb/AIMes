# 2026-05-21 报表中心 OTD 经营钻取

## 触发

功能深化计划中 `报表中心` 被标记为“可展示，缺钻取和业务解释”。现有 OTD 复盘能展示 `+14%` 改善和证据链，但管理者还缺少按证据追问“为什么改善、谁负责、下一步去哪处理”的经营复盘入口。

## 产出

- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `报表中心` OTD 改善复盘新增“经营复盘钻取”面板。
- 钻取面板读取统一 OTD 证据链，自动生成业务问题、业务解释、责任口径、风险状态和下一步动作。
- 支持按证据跳转到责任模块：`AI 排产`、`采购协同`、`设备维护`、`库存齐套`、`质量闭环` 或 `风险预警`。
- OTD 证据链卡片可点击选中经营钻取详情。
- CSV 导出新增 `OTD经营钻取` 行，把业务问题、责任模块和下一步动作导出。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`
- 通过：`npm run test:e2e -- tests/e2e/report.spec.ts`，13 passed。

## 下一步

继续把经营复盘从前端证据解释推进到真实 KPI 钻取：支持按客户、产线、产品族和时间窗口筛选 OTD 影响来源。
