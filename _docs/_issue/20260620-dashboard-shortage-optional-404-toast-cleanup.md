# 2026-06-20 Issue - Dashboard optional 短缺证据 404 弹 toast

## 现象
- 核心页面真实浏览器扫查发现 `/scheduling/dashboard` 首屏出现 `请求错误 Request failed with status code 404`。

## 根因
- `shortageEvidence.ts` 的 optional latest 读取未传 `suppressErrorToast`，且 404 在 fail-loud 场景会继续抛出。
- Dashboard 读取 `shortage-risk-resolution/latest` 时，暂无记录的 404 被全局 HTTP 拦截器展示为 toast。

## 处理
- optional latest 统一带 suppress toast。
- 404 统一解释为空状态。

## 状态
- 已关闭 Dashboard 首屏问题。
- 全站其它页面的 optional 404 toast 仍在后续 todo 中追踪。

