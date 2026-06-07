# 2026-06-04 Quality Knowledge Coverage Slice Plan

## Plan

- 目标：按覆盖率增量信号推进 A-track，不再精修已 100% 覆盖组件。
- 成功标准：选择低覆盖且业务关键文件；新增测试必须验证真实业务不变量；目标测试、全量 unit coverage、lint 均通过。
- 已执行：运行前端 coverage 基线；选择 `quality-knowledge-sample-sync.ts`；新增质量推荐版本选择测试；完成目标测试、全量 coverage、lint 验证。
- 当前结果：`quality-knowledge-sample-sync.ts` 行覆盖率 `14.10% -> 76.79%`；`KnowledgeGovernancePanel.vue` 行覆盖率提升到 `76.47%`；`DocumentUpload.vue` 行覆盖率提升到 `64.36%`；总行覆盖率 `66.79% -> 70.74%`。
- 已追加：灰度扩大 pending/approved、回滚复核问题单关闭、范围调整重开均有测试覆盖，并验证 OTD 证据状态。
- 已追加：资产治理输出 audit/trace 完整性测试，覆盖样本、禁用、负样本、再训练候选、推荐采纳、下一轮训练集、实验负样本、风险阈值。
- 已追加：训练集验证失败、验证通过、发布、回滚生命周期 OTD evidence 测试。
- 已追加：重新灰度发布分支测试，验证旧回滚不会误排除带 republish evidence 的 reopened R3。
- 已追加：backend-first 读取测试，验证有效后端 payload 优先、坏后端 payload 回退本地。
- 已追加：实验候选测试，验证 R5 回滚后 R6 负样本补丁、R7 影子验证/发布的 candidate type、audit/trace、nextAction、references。
- 已追加：坏数据/defaults 测试，验证 reuse closure、recommendation feedback 的空动作/指标记录被清洗，灰度决策 legacy defaults 会写回，坏后端 feedback 会回退本地。
- 已追加：backend-first 治理 payload 测试，验证 reuse draft、reuse closure、review queue、gray decision 的有效后端优先、legacy defaults 和坏后端回退。
- 已追加：`KnowledgeGovernancePanel` 实验候选按钮测试，验证 R6/R7/R9 动作的动态 aria-label、动态文案和 emit 参数。
- 已追加：`DocumentUpload` 质量知识成功路径测试，验证正式发布、灰度发布、回滚写入 history，并新增审计编号列让 auditId 可见。
- 已追加：`KnowledgeGovernancePanel` 再训练生命周期按钮测试，验证审批、校验、补齐重校、发布、回滚的 aria-label 和 emit 参数。
- 已追加：真实浏览器 smoke 修复，质量知识 evidence 和 OTD evidence 的 backend-first 读取在 Nuxt preview 返回 SPA HTML 时回退本地缓存，并把 `Agent 治理` e2e selector 校准为 `tab`。
- 已追加：`QualityBoard` 检验结果筛选空态 TDD 小片，筛选无匹配时显示 `暂无匹配检验记录`，原始无数据时保留 `暂无检验记录`。
- 已追加：`QualityBoard` 根因分析缓存重开 TDD 小片，关闭分析面板后可重开缓存结果，且不重复请求后端分析。
- 已追加：`QualityBoard` 根因分析 dialog 关闭按钮 a11y 小片，关闭控件新增 `aria-label="关闭根因分析"`。
- 已追加：`QualityBoard` 根因分析行级按钮 a11y 小片，每个按钮新增 `查看 {inspectionId} 根因分析` 的动态 `aria-label`。
- 已追加：`QualityBoard` 检验结果筛选控件 a11y 小片，筛选下拉框新增 `aria-label="筛选检验结果"`。
- 已追加：`QualityBoard` SPC 参数选择控件 a11y 小片，参数下拉框新增 `aria-label="选择 SPC 参数"`。
- 最新验证：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage `81 files / 360 tests passed`；`npm run lint` 通过。
- 当前结果：总行覆盖率提升到 `70.78%`；`QualityBoard.vue` 行覆盖率提升到 `61.40%`；`quality-knowledge-sample-sync.ts` 行覆盖率保持 `76.72%`；`otd-evidence-chain-sync.ts` 行覆盖率保持 `90.47%`。
- 下一步：继续按同一规则选择质量知识治理链路中剩余低覆盖面，优先真实浏览器 smoke；B-track 只在具备真实 GitHub repo/remote、staging 或人工签字证据时继续推进，避免空转。
