# 2026-06-11 Review: Sprint 0 前端 e2e 证据链回退

## 结论

原 13 个前端 e2e 聚焦用例中，admin/audit/quality 子链已绿；剩余 7 个红灯集中在两个共享读取链路：

- ChatPanel 生成的助手动作审计存在于本地记录，但 AuditDecisionReplayPanel 使用 fail-loud 后端读取失败后没有回退本地记录。
- Report 生成的 POC Hypercare 验收包存在于本地记录，但 MonitoringBoard 使用 fail-loud 后端读取失败后没有回退本地记录。

## 审查点

- 修复保留 fail-loud 文案，只增加本地 evidence fallback。
- 没有新增功能范围，只硬化已有“生成证据 -> 跨页面审计/监控可见”的精品路径。
- 7 个原始失败用例已用项目 e2e harness 真实浏览器验证通过。
- 13 个聚焦用例已用项目 e2e harness 真实浏览器验证通过。
- 完整前端 e2e 套件已用项目 e2e harness 真实浏览器验证通过：358 passed。
- 默认前端 unit 脚本已恢复可信：89 files / 596 tests passed，未再出现 unhandled errors。
- `npm run lint` 已通过。
- 覆盖率杠杆选片落在 `AuditDecisionReplayPanel`：旧 coverage summary 显示该组件是用户关键组件中的最低行覆盖候选之一，且审计回放直接支撑发布证据链。
- 新增质量灰度“扩大推荐范围”回放测试，不改生产代码；当前行为已正确，测试用于锁住已存在但低覆盖的关键分支。
- 覆盖率杠杆第二片落在 `AnomalyBoard`：全量 coverage 显示行覆盖 67.78%，且异常分流是现场态势、风险队列、质量闭环、AI 排产之间的用户关键链路。
- 新增质量异常分流 trace 测试，不改生产代码；当前行为已正确，测试用于锁住“确认分流 -> 写入 dispatch record -> 展示 trace/按钮状态”的证据链。
- Docker 恢复后复跑发布证据范围真实 Chrome e2e：生产构建 PASS，`login/audit/monitoring/quality` 共 78 passed，证明前端证据链不依赖已恢复环境的偶然状态。

## 风险

- 完整前端 e2e 已通过，但完整发布目标仍包含后端基线、环境闸门和人工闸门。
- 本轮只修复 unit mock/断言契约，没有重新定义组件行为；风险集中在后续后端/staging 证据仍未补齐。
- 发布级人工闸门仍需单独追踪，不能被前端测试绿灯替代。
- 单文件 coverage 只证明本切片分支增量，不代表全量前端覆盖率达标；后续仍应按“低覆盖且用户必经”继续选片。
- 本次复跑没有新增截图；沿用已有显式截图证据，新增的是同范围真实浏览器回归命令结果。
