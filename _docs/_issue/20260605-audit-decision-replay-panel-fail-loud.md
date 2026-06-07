# 2026-06-05 AuditDecisionReplayPanel Fail-loud Issues

## Fixed

- 问题：`AuditDecisionReplayPanel.vue` mounted 阶段 `readAgentConfigApprovalsBackendFirst()` 失败时会产生未处理异常，没有明确告知用户配置审批未加载。
- 风险：用户可能把“配置审批加载失败”误判成“0 个配置待审批”，发布合规和安全签字复核会缺少真实配置审批证据。
- 处理：捕获配置审批加载异常，保留基础审计回放卡片，并用 assertive alert 展示“配置审批加载失败”和失败原因。
- 处理：将 mounted 阶段其它 backend-first 审计来源也改为来源级捕获，避免单个来源失败打断整条回放加载链。
- 问题：`AuditDecisionReplayPanel.vue` 的业务落库审计列表读取失败时，内部 catch 会返回空数组，没有告知用户业务写入审计 API 失败。
- 风险：用户可能误判没有 Agent 业务落库回放，发布合规和安全签字复核缺少真实业务写入证据。
- 处理：列表 API 失败改为抛给来源级 fail-loud，显示“业务落库审计加载失败”和失败原因；单条详情失败仍忽略该条。
- 问题：业务落库审计三类动作批量读取时，单个动作类型 API 失败会让整批失败，导致其它成功读取的业务落库回放也消失。
- 风险：已存在的采购收货、质量处置或设备状态业务写入证据可能被另一类动作 API 失败掩盖。
- 处理：按动作类型逐批捕获失败，失败批次 fail loud，成功批次继续展示和选中。
- 问题：业务落库审计列表读取成功后，单条详情 `getAuditLogDetail()` 失败会静默返回 `null`，没有告知用户审计详情缺失。
- 风险：用户可能误以为同批次业务写入审计详情完整，发布合规和安全复核会漏看部分详情加载失败。
- 处理：详情失败时记录“业务落库审计详情加载失败”assertive alert，同时保留其它成功业务落库回放。
- 问题：业务落库审计详情存在但 `newValues` JSON 载荷损坏时，解析失败会静默返回 `null`，没有提示审计载荷不可用。
- 风险：损坏的审计详情会被误判为没有业务落库内容，发布合规和安全复核无法发现证据链损坏。
- 处理：解析失败时记录“业务落库审计详情加载失败”，并包含损坏 audit id 与解析失败原因；其它成功业务落库回放继续显示。
- 问题：业务落库审计详情包含 `businessWrite`，但资源类型不属于当前支持范围时，会在回放映射阶段静默消失。
- 风险：新增/异常业务写入资源无法被审计回放发现，发布复核可能误判审计链完整。
- 处理：未知资源记录“业务落库审计详情加载失败”，并包含 audit id 和不支持的资源类型；其它成功业务落库回放继续显示。
- 问题：业务落库审计详情加载成功但 `newValues` 为空时，会被静默过滤。
- 风险：审计记录存在但载荷缺失时，用户无法发现证据链缺口。
- 处理：缺失载荷记录“业务落库审计详情加载失败”，并包含 audit id 和“审计载荷缺失”；其它成功业务落库回放继续显示。
- 验证：目标 unit `1 file / 11 tests passed`，全量前端 unit coverage `82 files / 459 tests passed`，lint 通过。

## Remaining

- `AuditDecisionReplayPanel.vue` 行覆盖率当前为 `64.81%`；仍低于部分用户必经组件，后续可继续审计 POC 签署、质量推荐等其它审计来源 fail-loud 测试。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，Docker 可用；根 `.github/workflows/ci.yml` / `eval.yml` 存在；当前仓库 remote 仍不指向 GitHub，不能取得真实 hosted CI run。
