# Issue - Frontend Employee Demo Deeplink Pass

## Problem
- 用户访问员工页离线演示入口时，未登录会被带到登录页；登录成功固定进入 dashboard，原员工页目标丢失。
- 这会让手工验证入口绕路，并容易混入旧会话状态。

## Resolution
- 路由守卫将原始受保护目标写入登录页 `redirect`。
- 登录页仅接受站内 `/...` redirect，登录成功后回到原目标。

## Verification
- Unit PASS: 67/67，覆盖路由守卫、登录页、auth store、员工页。
- Employee offline-demo focused e2e PASS: 2/2。
- Employee full e2e PASS: 13/13。
