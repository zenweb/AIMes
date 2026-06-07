# 2026-06-05 首登改密闭环下一步

## Done

- 已完成：前端首登改密代码闭环。
- 已完成：相关单测补齐并通过。
- 已完成：Nuxt 真实入口补齐 `/change-password` 页面和 `mustChangePassword` 中间件守卫。
- 已完成：真实 Chrome e2e 证明 `login -> change-password -> login` 链路。

## Next

- 将首登改密视为前端链路已收口，后续只在发现后端契约变化时回归。
- 发布级 hosted CI、staging/PostgreSQL、灰度观察和安全签字继续在发布闸门轨道追踪。

## Note

- 真实浏览器证据已经补齐；不要再重复追同一条登录页链路，除非接口契约或 Nuxt 中间件发生变化。
