# 2026-06-20 Plan - 员工页真实登录态离线标记启动自愈

## 成功标准
- 真实后端 token 存在时，残留 `aimes_offline_demo=true` 不会导致员工列表请求被跳过。
- 员工页不展示 `员工列表加载失败` 或英文 skip 文案。
- demo token 场景不被破坏。

## 执行
- 已补 auth store 启动恢复单测，先确认旧行为失败。
- 已在 `loadUser()` 中对真实 token 清理 offline demo 标记。
- 已通过单测、构建、真实浏览器验证。

