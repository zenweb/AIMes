# Plan - Frontend Employee Demo Deeplink Pass

## Success Criteria
- 未登录访问员工离线演示深链后，登录成功返回员工页。
- 离线 demo 员工页不展示 `Offline demo mode skipped backend request`。
- 单测与员工真实浏览器 e2e 通过。

## Status
- Done: 路由守卫携带站内 redirect。
- Done: 登录页消费站内 redirect，并拒绝非站内跳转。
- Done: 单测 67/67、员工离线入口 focused e2e 2/2、员工全量 e2e 13/13 验证通过。

## Next
- 用新版本地入口复查手工登录路径时，避免继续使用旧 `4173` preview bundle。
- 继续全站真实浏览器 clean sweep，找其他旧会话或 offline demo 文案泄漏。
