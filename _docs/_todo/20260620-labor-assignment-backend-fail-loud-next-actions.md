# Todo: 人员替班/资质阻断后端审计 Fail Loud 后续

## 已完成
- [x] API 层人员替班/资质阻断读取支持显式 fail loud。
- [x] Sync 层 backend-first 读取支持显式 fail loud。
- [x] 非数组后端载荷给出明确审计错误。
- [x] 默认路径保持本地 fallback 和残缺记录过滤。

## 后续建议
- [ ] 用真实后端重新读取 `/api/v1/scheduling/labor-reassignments` 与 `/api/v1/scheduling/labor-qualification-blocks`，补 readback 证据。
- [ ] 给 `ReportBoard` 增加明确的人员替班/资质阻断展示或导出测试；当前过滤回归没有命中报表用例。
- [ ] 继续扫描其他 backend-first evidence sync，优先处理仍只有静默 fallback、没有 audit fail loud 的用户必经证据链。
