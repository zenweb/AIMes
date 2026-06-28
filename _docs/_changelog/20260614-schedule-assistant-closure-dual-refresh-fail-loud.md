# 2026-06-14 排产 Assistant 闭环双刷新 Fail-Loud

## 变更
- `queryAssistantEngineeringConstraintPackages` 增加可选 `failLoud`，默认仍保持旧的空数组兜底。
- `readAssistantEngineeringConstraintPackagesBackendFirst` 增加可选 `failLoud`，闭环刷新场景可传播后端失败。
- `ScheduleBoard.vue` 在 Assistant 恢复交接闭环后，恢复包刷新失败与工程约束包刷新失败会追加到同一条用户可见反馈，不再互相覆盖。
- 闭环刷新上下文使用 `Assistant 工程约束闭环刷新失败` 文案；启动阶段仍使用 `工程约束启动证据加载失败` 文案。
- 真实浏览器用例扩展为同时拦截恢复包与工程约束包接口 503，验证两个失败原因都可见。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps both assistant recovery and engineering refresh failures visible"` 曾失败，证明旧页面反馈只保留单一路径。
- RED：`npm run test:unit -- tests/unit/assistant-evidence-api.test.ts -t "assistant engineering constraint package reads"` 曾失败，证明 API 层吞掉工程约束包后端错误。
- RED：`npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts -t "fails loud for engineering constraint package refresh"` 曾失败，证明 sync 层回落本地包。
- GREEN：`npm run test:unit -- tests/unit/assistant-evidence-api.test.ts`，4 passed。
- GREEN：`npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts`，6 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，30 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，43 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 699 tests passed，lines 83.24%，`ScheduleBoard.vue` lines 77.26%。

## 范围
- 继续深挖现有排产交接闭环可观察性，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
