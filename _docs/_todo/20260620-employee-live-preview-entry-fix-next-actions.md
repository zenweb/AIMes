# 2026-06-20 Todo - Employee Live Preview Entry Fix Next Actions

## Next Actions
- 后续入口验证优先使用 `http://127.0.0.1:4173/scheduling/login` + 5003 后端，避免 5000 端口。
- 若新增预览/部署入口，必须验证 `/api/v1/auth/login` 返回 JSON 而不是 HTML fallback。
- 保持离线 demo 为显式入口，不要用构建级开关劫持普通登录。
