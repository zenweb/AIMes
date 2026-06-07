# 2026-06-06 DocumentUpload R7 影子验证真实浏览器证据计划

## Success Criteria

- 真实 Chromium 能复现 R7 影子验证写入失败。
- UI 显示 `质量实验影子验证失败`，包含底层错误原因。
- R7 候选不推进到 `影子验证已通过`。
- 上传历史不出现 R7 影子验证通过审计号。

## Execution

- 复用既有 Knowledge e2e 与生产构建流程。
- 只新增失败态浏览器证据，不改业务逻辑。
- 验证命令：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R7 影子验证写入失败"`。

## Result

- PASS：Nuxt production build passed，Chromium 1/1 passed。

## Next

- 按覆盖率杠杆继续选择低覆盖且用户必经的既有功能。
- B 轨发布闸门单独追踪，不用 A 轨测试绿灯替代。
