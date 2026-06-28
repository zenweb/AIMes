# Issue: 人员替班/资质阻断审计刷新会静默吞掉后端失败

## 现象
- `queryLaborReassignments` 与 `queryLaborQualificationBlocks` 在后端失败时始终返回 `[]`。
- `readLaborReassignmentsBackendFirst` 与 `readLaborQualificationBlocksBackendFirst` 没有显式审计失败模式。
- 后端返回非数组时会出现 `records.filter is not a function`，不能定位到人员证据载荷问题。

## 根因
- 普通 demo/local fallback 和审计刷新路径共用同一静默读取语义。
- 缺少后端响应形态检查。

## 修复
- 为 API 和 sync 读取函数增加 `{ failLoud?: boolean }`。
- 在 backend-first sync 层检查 `Array.isArray(records)`，否则抛出明确中文审计错误。
- 默认路径 catch 后仍回退本地记录，保持现有体验。

## 证据
- 红灯测试证明旧行为会静默返回 `[]` 或抛低价值 runtime 错误。
- 修复后 API/sync/关联组件聚焦测试通过。
