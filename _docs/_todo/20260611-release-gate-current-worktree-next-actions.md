# TODO：Release Gate 当前工作树复核后续

## 人工门

- 完成 Attack Chain A/B/C 人工验证：
  - A：未授权/低权限访问 API、Admin、Agent action 的边界验证。
  - B：凭据、token、日志、审计、前端状态、导出泄漏验证。
  - C：发布配置、CORS、依赖、弱配置提升验证。
- 为每条攻击链补 verifier、VerifiedAt、Manual verification PASS 和非占位 evidence。
- 使用 `scripts/run-security-signoff.ps1` 生成有效签字包，不手改 `UNSIGNED`。

## 灰度门

- 安全签字 PASS 后才能启动首次灰度。
- 灰度观察必须有 GrayReleaseId、起止时间、14 个自然日、P0/P1=0 和证据。

## CI 对齐

- 当前本地工作树含大量未提交改动；Hosted CI PASS 只证明当前远端 HEAD。
- 若要让 release gate 引用最新本地修改，需要先整理提交并推送，再重新跑 hosted CI 与 release gate audit。

