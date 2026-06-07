# Plan: Admin 治理证据加载隔离

## 成功标准

- `Knowledge -> Admin -> Agent 治理` 的质量灰度监控和实验候选证据在真实 Chromium 中可见。
- 任一治理证据源失败时，页面 fail-loud，同时其它证据继续加载。
- 不声明全量 Knowledge 套件通过，除非全量命令稳定 PASS。

## 执行记录

- [x] 查看失败快照，确认 Admin 面板质量灰度监控和实验候选为 `0 条`。
- [x] 检查 `AdminBoard` 初始化加载顺序，确认早期 backend-first 读取失败会阻断后续加载。
- [x] 增加 `loadAdminEvidenceItem` 隔离单项失败。
- [x] 用 Chromium 定向复跑 `R3 调整范围|R5 回滚后的 R6`。
- [x] 全量复跑 Knowledge e2e，Chromium 15/15 passed。
