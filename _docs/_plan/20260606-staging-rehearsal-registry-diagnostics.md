# Plan: Staging Rehearsal Registry Diagnostics

日期：2026-06-06

## 成功标准

- staging rehearsal 脚本能记录 Docker proxy/mirror/local image 状态。
- image pull timeout 可配置，避免每次固定等待 90 秒。
- 复跑能生成更精确的 FAIL/PASS evidence packet。
- 架构测试仍通过。

## 执行

- [x] 新增 `DockerPullTimeoutSeconds` 参数。
- [x] 新增 Docker registry/proxy diagnostics 报告段。
- [x] Parser 验证。
- [x] 架构过滤测试验证。
- [x] 生成 registry diagnostics staging 报告。
- [x] 生成引用新 staging 报告的 release gate audit。

## 验证

- Parser: PASS。
- Architecture filter: 12/12 passed。
- Staging rehearsal diagnostics: FAIL at image pull。
- Release gate audit: FAIL。
