# Plan: 员工列表真实登录态离线开关复核

## 成功标准
- 真实后端 token 不被陈旧 `aimes_offline_demo=true` 阻断。
- 员工列表入口不再显示 `Offline demo mode skipped backend request` 给用户。
- 4173 可访问入口恢复。

## 执行
1. 检查员工 API、HTTP 拦截器与 offline demo 工具函数。
2. 验证 5003 后端登录与员工接口。
3. 验证 4173 代理员工接口。
4. 跑员工页相关单测与前端构建。
5. 重启 4173 预览并探测登录入口。

## 当前状态
- API、代理、单测、构建、入口探测均通过。
- DOM 级浏览器证据因工具卡顿待补。

## 2026-06-20 真实浏览器补证
- 场景：`aimes_offline_demo=true` 陈旧离线开关 + 真实后端 JWT。
- 登录：`POST http://127.0.0.1:4173/api/v1/auth/login` 返回 200，token 前缀 `eyJhbGciOiJI`。
- 员工请求：`GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20` 返回 200。
- DOM：`http://127.0.0.1:4173/scheduling/employee`，`.emp-board=true`，`.emp-card` 数量 3。
- 页面正文：未包含 `Offline demo mode skipped backend request`。
- 控制台/请求失败/pageerror：未记录相关失败。
