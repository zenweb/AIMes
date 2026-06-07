# 2026-06-05 AuditDecisionReplayPanel Fail-loud Plan

## Success Criteria

- 配置审批加载失败时，不得出现 mounted hook unhandled rejection。
- 配置审批加载失败时，不得把失败静默表现为“0 个配置待审批”。
- 配置审批加载失败时，必须保留基础审计回放卡片和回放详情。
- 配置审批加载失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 单个 backend-first 审计来源失败时，不得打断其它来源继续加载。
- 业务落库审计列表 API 失败时，不得静默表现为没有业务落库回放。
- 业务落库审计列表 API 失败时，必须用 `[role="alert"]` 明确提示失败原因。
- 单条业务落库审计详情失败时，仍可只忽略该条，避免一个详情坏掉阻断整批。
- 单个业务落库动作类型 API 失败时，成功动作类型的业务落库回放必须继续显示。
- 单个业务落库动作类型 API 失败时，必须用 `[role="alert"]` 明确提示失败批次原因。
- 单条业务落库审计详情失败时，成功详情的业务落库回放必须继续显示。
- 单条业务落库审计详情失败时，必须用 `[role="alert"]` 明确提示详情加载失败原因。
- 单条业务落库审计详情载荷损坏时，成功详情的业务落库回放必须继续显示。
- 单条业务落库审计详情载荷损坏时，必须用 `[role="alert"]` 明确提示损坏 audit id 和解析失败原因。
- 单条业务落库审计详情资源类型不受支持时，成功详情的业务落库回放必须继续显示。
- 单条业务落库审计详情资源类型不受支持时，必须用 `[role="alert"]` 明确提示 audit id 和不支持的资源类型。
- 单条业务落库审计详情载荷缺失时，成功详情的业务落库回放必须继续显示。
- 单条业务落库审计详情载荷缺失时，必须用 `[role="alert"]` 明确提示缺失 audit id。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆从 `ChatPanel.vue` 转向 `AuditDecisionReplayPanel.vue`，该组件覆盖率更低且属于发布合规关键入口。
- 已完成：新增红灯测试覆盖 `readAgentConfigApprovalsBackendFirst()` 失败时不得静默误报配置审批为空。
- 已完成：修复 mounted 阶段审计来源同步，失败时显示来源级 assertive alert，并继续保留基础回放卡片。
- 已完成：新增红灯测试覆盖 `getAuditLogs()` 业务落库审计列表 API 失败时不得静默返回空回放。
- 已完成：修复业务落库审计读取边界，列表 API 失败交给来源级 fail-loud，单条详情失败仍忽略该条。
- 已完成：新增红灯测试覆盖单个动作类型 API 失败时不得冲掉其它成功业务落库回放。
- 已完成：修复业务落库审计读取为逐动作批次保留，失败批次 fail loud，成功批次继续回放。
- 已完成：新增红灯测试覆盖单条业务落库审计详情失败时不得静默吞掉错误。
- 已完成：修复单条详情失败边界，失败详情 fail loud，成功详情继续回放。
- 已完成：新增红灯测试覆盖单条业务落库审计详情载荷损坏时不得静默吞掉解析失败。
- 已完成：修复载荷解析失败边界，损坏详情 fail loud，成功详情继续回放。
- 已完成：新增红灯测试覆盖未知业务落库资源不得静默消失。
- 已完成：修复未知资源边界，未知资源详情 fail loud，成功详情继续回放。
- 已完成：新增红灯测试覆盖业务落库审计详情载荷缺失不得静默消失。
- 已完成：修复缺失载荷边界，缺失详情 fail loud，成功详情继续回放。
- 已验证：目标 unit `1 file / 11 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 459 tests passed`；总行覆盖率 `76.02%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `64.81%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆审计 `AuditDecisionReplayPanel.vue`、`ChatPanel.vue` 或 `RiskActionQueuePanel.vue`；优先选择用户必经且发布/合规相关的失败路径。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前根 `.github/workflows/ci.yml` / `eval.yml` 已存在；`gh` 已登录但 remote 仍是腾讯工蜂，Hosted CI 需要 GitHub repo 绑定后才能实跑取证。
