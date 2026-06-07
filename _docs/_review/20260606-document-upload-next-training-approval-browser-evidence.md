# 2026-06-06 DocumentUpload 下一训练集审批失败 Review

## Findings

- 未发现本片新增阻断问题。
- 真实浏览器验证了 R3 下一训练集审批写入失败时的用户可见告警、状态保留和历史防伪造。
- 本片补上此前自审中记录的“e2e 未覆盖审批失败分支”缺口。

## Residual Risk

- 本片只跑目标 e2e，未跑整份 `knowledge.spec.ts`。
- 下一训练集校验、实验候选合并/影子验证虽已有部分真实证据或单测，仍应继续按真实 UI 入口逐项补强。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "下一轮训练集审批写入失败"`：Chromium 1/1 passed。
