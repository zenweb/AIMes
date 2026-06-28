# 2026-06-12 Todo：排产拖拽保存 PostgreSQL/staging 后续

## 已关闭

- 真实 PostgreSQL 下排产拖拽 PATCH 500。
- PATCH 成功但缺少 PostgreSQL 与 GET read model 一致性证据。
- 排产 GET 被 LLM API key 缺失拖垮。

## 下一步

- 将 staging rehearsal 脚本显式标注或增加 API rebuild 开关，避免再次用旧镜像误判修复无效。
- 把 `AIMES_RUN_POSTGRES_TESTS=true` 的 PostgreSQL 定向测试纳入可选发布前验证清单。
- 继续当前排产页精品化主线：优先补真实浏览器拖拽后的页面刷新读回证据，而不是扩新功能。

## 暂不做

- 不扩展新的排产功能。
- 不把所有仓储读路径改成 tracked。
- 不把安全项作为本片优先级；此片只关闭排产保存深度证据缺口。
