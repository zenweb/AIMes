# 2026-06-20 Issue - 报表 optional latest 404 误报加载失败

## 现象
真实浏览器访问 `/scheduling/report` 时，多个 optional latest 接口返回 404，页面展示：
- `报表证据加载失败...`
- 全局 `请求错误 Request failed with status code 404` toast

## 根因
报表启动证据读取把“暂无 latest 记录”的 404 当成真实加载失败聚合；部分 API 封装未使用 `suppressErrorToast`，导致空状态同时触发全局错误 toast。

## 修复
- optional latest 404 返回 `null`。
- optional latest 请求加 `suppressErrorToast`。
- 保留非 404 异常的 fail-loud 行为。

## 验证
- 6 个前端单测文件 60 条测试通过。
- 前端 build 通过。
- 真实浏览器报表页无用户可见报表证据失败、无请求错误 toast。
