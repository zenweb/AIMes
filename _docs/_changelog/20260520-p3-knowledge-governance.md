# 2026-05-20 P3 — 文档与知识库治理

## 触发

深化计划中 P3 “文档与知识库”要求补齐文档分类、版本、索引状态、引用追踪和过期知识提醒。当前 `文档上传` 页面只有上传队列和历史记录，缺少 RAG 数据治理视图。

## 产出

- 新增 `src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue`
- 新增 `src/frontend/tests/e2e/knowledge.spec.ts`
- 更新 `src/frontend/src/components/knowledge/DocumentUpload.vue`
- 新增 `src/frontend/src/utils/knowledge-governance-sync.ts`
- 更新 `src/frontend/src/utils/knowledge-citations.ts`
- 更新 `src/frontend/src/components/admin/AdminBoard.vue`
- 更新 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `src/frontend/tests/e2e/admin.spec.ts`
- 更新 `src/frontend/tests/e2e/audit.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 文档上传页新增“RAG 数据治理”面板。
- 治理面板展示：
  - 文档分类
  - 版本
  - 索引状态
  - 有效期
  - 引用模块
  - 过期风险
- demo 治理数据覆盖：
  - `CNC 精加工 SOP V2.3`：已索引，引用 AI 生产助手、工艺路线、生产报工。
  - `装配扭矩检验规范 V1.8`：即将过期，引用质量闭环、AI 生产助手。
  - `CNC-01 主轴维护手册 V1.1`：待索引且已过期，引用设备维护、风险预警、AI 排产。
- 上传成功的文档会自动进入治理队列，状态为“待索引”，并提示补有效期和引用范围。
- 继续新增“复核并重建索引”处置动作：
  - `CNC-01 主轴维护手册 V1.1` 可由设备主管/知识库管理员复核为 `V1.2`。
  - 复核后索引状态变为“已索引”，有效期延至 `2026-12-31`，引用范围更新为 `AI 生产助手 / 设备维护 / 风险预警 / AI 排产`。
  - 复核动作生成 `AUD-KG-REINDEX-20260520-001` 与 `TRACE-KG-CNC-MAINT-REINDEX`，并写入统一 OTD 证据链的 `知识治理` 阶段。
  - AI 生产助手引用链会读取该复核记录，原来的过期/待索引阻断提示会升级为可正式引用的治理复核来源。
- 继续把复核记录接入治理与审计：
  - `系统管理 > Agent 治理` 新增“知识来源治理”，展示复核动作、版本升级、有效期、引用范围和审计编号。
  - Agent 治理指标新增 `知识复核` 数量，让治理页能看到 RAG 来源是否已经完成复核，而不是只依赖文档上传页。
  - `审计日志` AI 决策回放新增 `知识治理` 动态卡片，可回放过期/待索引识别、复核人、索引重建、引用范围更新和 `TRACE-KG-CNC-MAINT-REINDEX`。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/knowledge.spec.ts --reporter=list --workers=1 --retries=0`，2 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，93 passed。
- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts`，5 passed。
- 通过：`npm run test:e2e -- tests/e2e/knowledge.spec.ts tests/e2e/chat.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`，33 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts --grep "知识治理"`，2 passed。
- 通过：`npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`，14 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续把知识治理从单条演示记录扩展为批量复核队列：支持多文档筛选、复核责任人分派、批量重建索引和导出知识来源审计包。
