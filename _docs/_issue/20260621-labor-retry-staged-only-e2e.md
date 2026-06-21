# Issue: staged-only labor retry failed before API/utils dependencies

## 现象

staged-only E2E 初次失败：

- `人员证据启动读取失败后可重试并释放排产人员约束`
- 失败点：`.warnings-bar` 不存在。

## 根因

- `ScheduleBoard.vue` 调用了 `readLaborQualificationBlocksBackendFirst({ failLoud: true })` 与 `readLaborReassignmentsBackendFirst({ failLoud: true })`。
- 但 staged-only tree 一开始没有包含 `executionEvidence.ts` 与 `labor-assignment-sync.ts` 的 `failLoud` 透传。
- 结果后端 503 被 API/backend-first fallback 吞成空数组，组件认为人员证据读取成功但为空，因此不会展示启动失败预警。

## 处理

- 将人员替班 / 人员资质阻断两个 API 查询的 `failLoud` 参数纳入本切片。
- 将 labor backend-first utils 的 `failLoud` 透传与重抛纳入本切片。
- 重新导出 staged-only tree 后目标 E2E 通过。

## 防复发

- 对依赖 fail-loud 行为的 UI 切片，staged-only 验证必须包含 API 层、utils 层、组件层、E2E 层的完整链路。
- 不用工作区通过替代 staged-only 通过。
- release-candidate manifest 必须列出 staged diff 中全部 code/script 文件；边界脚本已改为发现缺失即 FAIL，避免只检查部分文件造成假阳性。
