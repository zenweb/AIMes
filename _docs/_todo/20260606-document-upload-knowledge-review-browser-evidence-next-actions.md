# DocumentUpload 知识复核真实浏览器证据下一步

- [x] 给知识复核写入失败补真实 Chromium 用例。
- [x] 单跑新增用例并记录 PASS。
- [x] 修复或隔离 `knowledge.spec.ts` 中 Admin 治理面读不到质量知识灰度/实验候选证据的问题。
- [x] 修复后复跑整份 `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts`，Chromium 15/15 passed。
- [ ] 不再继续精修已通过的 Audit/Chat/Anomaly 浏览器证据，优先处理当前真实失败。
