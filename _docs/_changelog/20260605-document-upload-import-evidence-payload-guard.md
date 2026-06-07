# 2026-06-05 Document Upload Import Evidence Payload Guard Changelog

## Change

- 选片依据：继续收口 `DocumentUpload.vue` 知识库导入入口；文档上传坏载荷已修，本片补客户工单导入证据刷新坏载荷。
- 新增红灯测试：后端返回 HTML / 非客户工单导入证据载荷时，不能把 truthy 坏值写入 `customerOrderImport`，也不能渲染 `undefined 单高风险已识别`。
- 修复：新增 `isCustomerOrderImportEvidence()` 运行时守卫，要求批次、文件名、来源、导入数量、高风险数量、映射字段和准备时间均为有效业务字段。
- 坏载荷复用刷新失败 fail-loud 路径，通过 `.error-msg[role="alert"]` 暴露 `后端返回非客户工单导入证据载荷`，并保留本地/空导入样例状态。

## Validation

- 红灯：`npm run test:unit -- tests/unit/document-upload.test.ts` 先失败；旧行为无 alert，并渲染 `undefined 单高风险已识别`。
- 绿灯：`npm run test:unit -- tests/unit/document-upload.test.ts`：1 file / 15 tests passed。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：83 files / 493 tests passed；总行覆盖率 `76.71%`；`DocumentUpload.vue` 行覆盖率 `65.65%`。
- 注意：全量覆盖率退出码为 0，但 Vitest 结束时提示一个 fork worker 终止超时；未影响测试通过结论，后续若重复出现应单独收敛测试进程退出问题。

## Release Boundary

- 本片属于 A-track 知识库导入可靠性证据。
- Hosted CI、staging/PostgreSQL rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
