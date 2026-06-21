# Plan: schedule-labor-evidence-retry staged-only closure

## 目标

让排产页在人员证据启动读取失败时 fail loud，并提供重试恢复路径；同时保持切片边界干净、可审计。

## 已完成

1. 清理 staged 边界
   - 从 `scheduling.spec.ts` 的整文件 staged 中剔除 dhtmlx、Assistant 交接、多目标反馈等无关主题。

2. 补齐功能链路
   - API 查询支持 `failLoud`。
   - backend-first utils 支持 `failLoud` 重抛与远端/本地证据合并。
   - ScheduleBoard 启动失败显示预警，重试成功后释放人员约束并刷新事件。

3. 验证
   - cached diff clean。
   - release candidate slice boundary PASS。
   - staged-only E2E PASS。
   - 人员证据相邻 unit / E2E 子集 PASS。
   - manifest 覆盖全部 5 个 staged code/script 文件，hunk map 显示没有 diff 文件缺失 manifest。

## 下一步

- 保留此候选切片状态，下一轮可考虑全量 scheduling E2E 或继续处理下一个 release-candidate slice。
- 若需要提交，先复跑边界与目标 E2E，不做整文件 staging。
