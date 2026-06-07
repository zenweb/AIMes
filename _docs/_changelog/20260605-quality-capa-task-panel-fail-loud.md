# 2026-06-05 QualityCapaTaskPanel Fail-loud Changelog

## Quality Knowledge Reuse Effect Verification Failure Slice

- 选片依据：按覆盖率杠杆重新排序，`QualityCapaTaskPanel.vue` 行覆盖率约 `61.46%`，且质量知识复用效果验证是质量 CAPA 闭环、知识反馈和后续推荐排序的关键出口。
- 问题：点击“验证复用效果并回写”后，如果 `verifyQualityKnowledgeReuseClosure()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：正式 CAPA 仍处于待验证状态，但用户可能误以为复用效果已经回写；质量知识排序、后续训练集和审计回放会缺少真实效果证据。
- 修复：复用效果验证回写失败时捕获异常，保留 approved 待验证状态，显示 `role="alert"` / `aria-live="assertive"` 的“质量知识复用效果验证失败：...”提示。
- 行为保持：回写成功时仍更新为 verified 状态，并用 `role="status"` / `aria-live="polite"` 宣告评分回写结果。
- 测试：新增 TDD 用例 `keeps approved reuse closure pending and alerts when effect verification sync fails`，先红于 Vue unhandled error 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 444 tests passed`，总行覆盖率 `75.74%`，`QualityCapaTaskPanel.vue` 行覆盖率 `64.60%`。
- 验证：`npm run lint` 通过。

## Low Score Review Queue Creation Failure Slice

- 问题：点击“生成低分样本复核队列”后，如果 `writeQualityKnowledgeReviewQueueRecord()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：低分样本并未进入人工复核队列，但用户可能误以为已生成复核任务；质量知识复用排序的“低分禁用/再训练候选”闭环会缺少真实队列证据。
- 修复：低分复核队列生成失败时捕获异常，不创建本地复核卡，保留“生成低分样本复核队列”按钮，并显示 `role="alert"` / `aria-live="assertive"` 的“低分样本复核队列生成失败：...”提示。
- 行为保持：生成成功时仍写入复核队列、显示复核卡，并以 `role="status"` / `aria-live="polite"` 宣告进入复核队列。
- 测试：新增 TDD 用例 `keeps low score review queue uncreated and alerts when queue sync fails`，先红于 Vue unhandled error 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 445 tests passed`，总行覆盖率 `75.76%`，`QualityCapaTaskPanel.vue` 行覆盖率 `66.66%`。
- 验证：`npm run lint` 通过。

## Low Score Review Queue Closure Failure Slice

- 问题：点击“完成复核并禁用直接复用”后，如果 `closeLowScoreQualityKnowledgeReviewQueueRecord()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：低分样本仍处于待复核状态，但用户可能误以为复核已关闭且直接复用已禁用；质量知识再训练候选和审计回放会缺少真实关闭证据。
- 修复：低分复核队列关闭失败时捕获异常，保留 open 队列卡片和“完成复核并禁用直接复用”按钮，并显示 `role="alert"` / `aria-live="assertive"` 的“低分样本复核队列关闭失败：...”提示。
- 行为保持：关闭成功时仍更新复核队列为 closed，并以 `role="status"` / `aria-live="polite"` 宣告复核结论进入知识再训练候选。
- 测试：新增 TDD 用例 `keeps low score review queue open and alerts when queue closure sync fails`，先红于 Vue unhandled error 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 446 tests passed`，总行覆盖率 `75.79%`，`QualityCapaTaskPanel.vue` 行覆盖率 `69.42%`。
- 验证：`npm run lint` 通过。

## Published Recommendation Adoption Failure Slice

- 问题：点击“采纳发布推荐并回写效果”后，如果 `acceptQualityKnowledgeRecommendation()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：发布推荐并未写入采纳反馈，但用户可能误以为推荐已采纳并进入下一轮训练；质量知识复用排序、训练集迭代和审计回放会缺少真实采纳证据。
- 修复：发布推荐采纳失败时捕获异常，保留推荐卡和“采纳发布推荐并回写效果”按钮，不显示采纳反馈，并显示 `role="alert"` / `aria-live="assertive"` 的“质量知识发布推荐采纳失败：...”提示。
- 行为保持：采纳成功时仍刷新推荐反馈记录，并以 `role="status"` / `aria-live="polite"` 宣告效果趋势和下一轮训练集。
- 测试：新增 TDD 用例 `keeps published recommendation available and alerts when adoption sync fails`，先红于 Vue unhandled error 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 447 tests passed`，总行覆盖率 `75.86%`，`QualityCapaTaskPanel.vue` 行覆盖率 `74.40%`。
- 验证：`npm run lint` 通过。

## Assistant Quality Action Closure Failure Slice

- 问题：点击“确认首件复核闭环”后，如果 `closeAssistantRecoveryQualityAction()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：助手执行包质量责任动作仍未闭合，但用户可能误以为首件复核已完成；交期恢复执行包的质量责任、审计轨迹和后续复盘会缺少真实闭环证据。
- 修复：助手执行包质量责任闭环失败时捕获异常，保留助手质量责任卡和“确认首件复核闭环”按钮，并显示 `role="alert"` / `aria-live="assertive"` 的“助手执行包质量责任闭环失败：...”提示。
- 行为保持：闭环成功时仍刷新助手执行包、写入质量责任审计记录，并以 `role="status"` / `aria-live="polite"` 宣告闭环摘要。
- 测试：新增 TDD 用例 `keeps assistant quality action open and alerts when closure sync fails`，先红于 Vue unhandled error 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 448 tests passed`，总行覆盖率 `75.90%`，`QualityCapaTaskPanel.vue` 行覆盖率 `77.51%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端质量 CAPA 闭环可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
