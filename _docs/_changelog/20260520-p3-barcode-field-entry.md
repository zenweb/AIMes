# 2026-05-20 P3 — 条码扫描升级为现场入口

## 触发

深化计划中 P3 “条码”要求条码从工具变成现场入口：扫工单进入报工，扫设备进入设备详情，扫物料进入库存/BOM。当前扫描页只展示查询结果，无法带用户进入业务上下文。

## 产出

- 更新 `src/frontend/src/components/scanner/ScannerBoard.vue`
- 新增 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 扫 `WO-*` 工单码时展示工单信息，并提供：
  - 进入生产报工
  - 查看排产影响
- 扫 `CNC-01 / EQ-* / HT-* / ASM-*` 设备码时展示设备状态，并提供：
  - 查看设备详情
  - 查看实时监控
- 扫 `M-*` 物料码时展示物料库存/缺料状态，并提供：
  - 查看库存齐套
  - 查看 BOM 用量
- 后端 `/scan/{code}` 不可用时，前端提供 demo fallback，保证售前演示可用。
- 扫描历史保留，点击历史项可复扫。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/scanner.spec.ts --reporter=list --workers=1 --retries=0`，3 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，90 passed。
- 非阻断警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900k。

## 下一步

继续 P3：文档与知识库治理，补文档分类、版本、索引状态、引用追踪和过期知识提醒。
