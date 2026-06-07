# 2026-06-06 SkillMatrixPanel 人员证据同步写入失败 Chromium 证据

## 变更

- 新增人员管理 e2e：`人员证据同步写入失败时真实浏览器展示 fail-loud 且不伪造 OTD 证据`。
- 真实 Chromium 中模拟 `aimes_otd_evidence_chain` 写入失败，验证人员技能矩阵显示 `人员证据同步失败`。
- 验证失败时不显示同步成功文案，不写入伪造 OTD 人员能力证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "人员证据同步写入失败"
```

结果：`1 passed`。
