# Plan: 人员替班/资质阻断后端审计 Fail Loud

## 成功标准
- 默认读取路径在后端失败时保留本地 fallback。
- 显式审计路径 `{ failLoud: true }` 在后端失败时 reject。
- 后端返回非数组载荷时给出明确审计错误。
- 残缺后端记录不会覆盖本地完整人员替班/资质阻断证据。

## 执行
1. 读取 `executionEvidence.ts`、`labor-assignment-sync.ts` 和对应测试。
2. 补红灯测试：API fail loud、sync fail loud、非数组载荷错误。
3. 最小实现 fail-loud 参数与非数组载荷检查。
4. 跑聚焦测试、关联回归、lint、diff check。

## 状态
- 已完成本片。
