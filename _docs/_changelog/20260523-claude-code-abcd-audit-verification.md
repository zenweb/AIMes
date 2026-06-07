# 2026-05-23 Claude Code A/B/C/D 审计复核

## 变更

- 新增 `_docs/_review/20260523-claude-code-abcd-audit-verification.md`。
- 复核 Claude Code 声称的 A/B/C/D 四轮完成状态，记录实际验证命令、通过项、失败项和口径偏差。

## 验证

- `dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false`：通过，0 warning / 0 error。
- `dotnet test src\backend\AIMes.slnx --no-build -p:UseSharedCompilation=false`：Unit 308 passed；Integration 117 passed / 1 failed。
- `powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1`：连续 2 次通过，当前报告为 40.00% -> 56.67%，p=0.1965。
- `npm run build`：通过，保留 Node DEP0180 warning。
- `npm run test:e2e`：257 passed / 1 failed，失败点为 `purchase.spec.ts:273` 断言旧的“延期减少 5 单”。

## 遗留

- 全量后端测试未绿：`PerformanceTests.GetAllPlans_Performance`。
- 全量前端 e2e 未绿：`purchase.spec.ts:234`。
- 复盘文档中的 A/B 数字与当前脚本输出不一致。
- T-27 演示视频仍未实际录制。

