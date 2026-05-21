# 2026-05-20 OTD 证据链统一来源

## 变更

- 新增 `src/frontend/src/utils/otd-evidence-chain-sync.ts`，统一 OTD 证据链记录结构和本地存储键 `aimes_otd_evidence_chain`。
- `AI 排产` 调度员反馈、`风险预警` 处置留痕、`质量闭环` CAPA 验证和 `POC` 签署在保留原存储键的同时写入统一证据链。
- `采购协同` 模拟加急收货后写入 `采购回写` 证据，串联采购单、受影响工单、缺料清零和排产复核。
- `设备维护` 停机同步与客户真实设备故障样例写入 `设备维护 / 设备实证` 证据，串联停机窗口、替代设备、客户信号和 POC 批次。
- `生产报工` 完工后写入 `生产完工` 证据，串联完工数量、工单进度、质检结果和 OTD 状态。
- `报表中心` 优先读取统一证据链，保留旧键 fallback，并在 CSV 中导出统一证据。
- `MainLayout.vue` 改为显式 `vue-router` 导入，修复 `vue-tsc` 对 Nuxt 自动导入不可见的问题。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/purchase.spec.ts tests/e2e/equipment.spec.ts tests/e2e/production.spec.ts tests/e2e/report.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/risk.spec.ts tests/e2e/quality.spec.ts`：69 passed。

## 后续

- 继续把库存齐套、实时监控事件、工程约束审批和人员技能校验纳入统一证据链。
- 下一轮应优先让 `系统管理` 与 `审计日志` 能按证据链记录自动聚合治理状态，而不是继续在各页面单独拼卡片。
