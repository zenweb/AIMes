# 2026-06-05 AuditDecisionReplayPanel Fail-loud Changelog

## Configuration Approval Sync Failure Slice

- 选片依据：按覆盖率杠杆重新排序，`AuditDecisionReplayPanel.vue` 当前行覆盖率约 `62.06%`，且审计回放是发布合规、安全签字和 POC 复盘证据链的关键入口。
- 问题：审计回放 mounted 阶段读取关键配置审批时，如果 `readAgentConfigApprovalsBackendFirst()` 失败，会产生 Vue mounted hook unhandled rejection，页面没有明确失败提示。
- 风险：配置审批数据未加载，但用户只能看到 0 个待审批，容易误判配置变更已经清空；同时异常会打断后续审计回放来源加载。
- 修复：审计回放各 backend-first 来源独立捕获失败，失败时显示 `role="alert"` / `aria-live="assertive"` 的“配置审批加载失败：...”提示，并继续保留基础回放卡片。
- 行为保持：配置审批加载成功时仍显示审批列表和待审批计数；其它来源失败也会分别显示来源级 fail-loud 提示，不吞掉整页回放。
- 测试：新增 TDD 用例 `keeps replay cards visible and alerts when configuration approvals fail to load`，先红于 mounted hook unhandled rejection 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 453 tests passed`，总行覆盖率 `75.95%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `61.86%`。
- 验证：`npm run lint` 通过。

## Backend Business-write Audit API Failure Slice

- 问题：业务落库审计回放读取 `getAuditLogs()` 失败时，`readBackendAgentActionAudits()` 内部 catch 会直接返回空数组，外层来源级 fail-loud 无法感知失败。
- 风险：Agent 业务落库审计 API 失败会被误判为“没有业务落库回放”，发布合规和安全签字复核会缺少真实业务写入审计证据。
- 修复：业务落库审计列表读取失败不再被内部吞掉，交给 mounted 阶段来源级捕获，并显示“业务落库审计加载失败：...”alert；单条详情读取失败仍按原行为忽略该条，避免一个详情坏掉阻断整批。
- 行为保持：业务落库审计读取成功时仍映射采购、质量、设备业务对象回放；基础 AI 建议和重排动作回放继续可见。
- 测试：新增 TDD 用例 `keeps replay cards visible and alerts when backend business-write audits fail to load`，先红于缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 454 tests passed`，总行覆盖率 `75.97%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `62.35%`。
- 验证：`npm run lint` 通过。

## Partial Business-write Audit API Failure Slice

- 问题：业务落库审计同时读取采购、质量、设备三类 Agent 执行动作时，只要其中一个 `getAuditLogs()` 失败，`Promise.all` 会让整批读取失败，已成功读取的业务落库回放也会丢失。
- 风险：例如采购收货落库审计已经可回放，但质量处置审计 API 失败会导致采购回放也消失；发布合规复核会少看已存在的业务写入证据。
- 修复：业务落库审计按动作类型逐批捕获失败，失败批次显示“业务落库审计加载失败：...”alert，成功批次继续进入回放列表并可被选中。
- 行为保持：单条详情读取失败仍只忽略该条；全部动作类型失败时仍显示基础回放卡片和来源级 alert。
- 测试：新增 TDD 用例 `keeps successful business-write replay entries when one audit action fails to load`，先红于采购成功批次被失败批次冲掉，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 455 tests passed`，总行覆盖率 `75.96%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `62.40%`。
- 验证：`npm run lint` 通过。

## Business-write Audit Detail Failure Slice

- 问题：业务落库审计列表读取成功后，单条 `getAuditLogDetail()` 失败会被内部 `catch` 静默吞掉，只返回 `null`，页面没有提示审计详情缺失。
- 风险：用户能看到部分业务落库回放，但不知道同批次还有审计详情加载失败；发布合规和安全复核可能误以为业务写入审计链完整。
- 修复：详情读取失败时继续忽略该条以保留其它成功回放，同时通过 `recordReplaySyncError('业务落库审计详情', error)` 显示 assertive alert。
- 行为保持：成功详情仍进入采购、质量、设备业务落库回放；失败详情不会阻断同批次其它成功审计详情。
- 测试：新增 TDD 用例 `keeps successful business-write replay entries and alerts when one audit detail fails to load`，先红于缺失 `.replay-sync-alert`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 456 tests passed`，总行覆盖率 `75.98%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `62.93%`。
- 验证：`npm run lint` 通过。

## Business-write Audit Payload Parse Failure Slice

- 问题：业务落库审计详情加载成功后，如果 `newValues` JSON 载荷损坏，`parseAgentActionAuditPayload()` 会静默返回 `null`，页面把损坏详情表现为“没有业务写入回放”。
- 风险：审计详情存在但载荷不可解析时，发布合规和安全复核会漏掉证据链损坏信号，误判业务落库审计完整。
- 修复：解析失败时继续过滤损坏详情以保留其它成功回放，同时显示“业务落库审计详情加载失败：{auditId} 审计载荷解析失败：...”assertive alert。
- 行为保持：合法载荷仍映射为采购、质量、设备业务落库回放；损坏载荷不会阻断同批次其它成功详情。
- 测试：新增 TDD 用例 `keeps successful business-write replay entries and alerts when one audit detail payload is malformed`，先红于缺失 `.replay-sync-alert`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 457 tests passed`，总行覆盖率 `75.99%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `63.60%`。
- 验证：`npm run lint` 通过。

## Business-write Unsupported Resource Slice

- 问题：业务落库审计详情解析成功且包含 `businessWrite`，但 `resource` 不是当前支持的 `purchase-order` / `quality-inspection` / `equipment` 时，详情会在回放映射阶段静默 `return null`。
- 风险：后端新增或异常业务落库资源会被误判为“没有业务落库回放”，发布合规和安全复核无法发现审计资源类型不受前端回放支持。
- 修复：读取业务落库审计时校验支持的 `businessWrite.resource`；未知资源显示“业务落库审计详情加载失败：{auditId} 不支持的业务落库资源：...”assertive alert，并过滤该条。
- 行为保持：已支持的采购、质量、设备业务落库回放继续展示；未知资源不会阻断同批次其它成功详情。
- 测试：新增 TDD 用例 `keeps successful business-write replay entries and alerts when one business-write resource is unsupported`，先红于缺失 `.replay-sync-alert`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 10 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 458 tests passed`，总行覆盖率 `76.01%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `64.55%`。
- 验证：`npm run lint` 通过。

## Business-write Missing Payload Slice

- 问题：业务落库审计详情加载成功但 `newValues` 为空时，`parseAgentActionAuditPayload()` 会静默返回 `null`，页面把该详情表现为“没有业务落库回放”。
- 风险：审计详情存在但载荷缺失时，发布合规和安全复核无法发现证据链缺口，容易误判 Agent 业务写入审计完整。
- 修复：`newValues` 缺失时显示“业务落库审计详情加载失败：{auditId} 审计载荷缺失”assertive alert，并过滤该条。
- 行为保持：同批次合法采购、质量、设备业务落库回放继续展示；缺失载荷不会阻断其它成功详情。
- 测试：新增 TDD 用例 `keeps successful business-write replay entries and alerts when one audit detail payload is missing`，先红于缺失 `.replay-sync-alert`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1 file / 11 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 459 tests passed`，总行覆盖率 `76.02%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `64.81%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端审计回放可靠性证据。
- 根 `.github/workflows/ci.yml` / `eval.yml` 已存在且包含 backend/frontend/container/security/eval job；但 hosted CI 仍缺真实 GitHub Actions run。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
