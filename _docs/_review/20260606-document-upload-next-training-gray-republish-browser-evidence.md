# 2026-06-06 DocumentUpload 下一训练集重新灰度发布失败 Review

## Findings

- 未发现本片新增阻断问题。
- 真实浏览器验证了 R3 重新灰度发布写入失败时的用户可见告警、校验通过状态保留和历史防伪造。

## Residual Risk

- 本片只跑目标 e2e，未跑整份 `knowledge.spec.ts`。
- 灰度监控决策写入失败仍可继续按真实 UI 入口补强。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R3 重新灰度发布写入失败"`：Chromium 1/1 passed。
