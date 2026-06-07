# 2026-06-05 DocumentUpload Fail-loud Plan

## Success Criteria

- 客户工单导入证据后端刷新失败时，不能静默吞错。
- 同一失败必须通过 assertive alert 明确显示失败原因。
- 页面必须保留本地导入样例状态和客户工单导入面板，避免刷新失败导致关键入口消失。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 `readCustomerOrderImportEvidenceBackendFirst()` 失败时必须显示失败原因。
- 已完成：修复 `DocumentUpload.vue`，将静默 catch 改为 fail-loud alert。
- 已验证：目标 unit `1 file / 13 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 481 tests passed`；总行覆盖率 `76.86%`，`DocumentUpload.vue` 行覆盖率 `64.89%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆选择下一条用户关键路径。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需用户确认创建或提供。
