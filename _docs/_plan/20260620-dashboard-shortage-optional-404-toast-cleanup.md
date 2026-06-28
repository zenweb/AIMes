# 2026-06-20 Plan - Dashboard 短缺证据 optional 404 toast 清理

## 成功标准
- Dashboard 首屏不再出现短缺证据 optional 404 触发的 `请求错误` toast。
- 缺料/齐套/供应相关 optional latest 404 均返回 `null`。
- 非 404 后端失败在 fail-loud 调用中仍抛出。

## 执行结果
- 已补失败测试并确认红灯。
- 已最小修改 `shortageEvidence`。
- 已通过单测、构建和真实浏览器验证。

