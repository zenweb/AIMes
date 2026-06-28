# 2026-06-20 Issue - 员工列表被 stale offline demo 标记跳过

## 现象
- 用户反馈员工列表展示本地示例数据，并显示：`Offline demo mode skipped backend request: /api/v1/employee`。

## 根因
- 登录成功路径已有清理 `aimes_offline_demo=false`，但浏览器刷新或直接进入已登录页面时，auth store 启动恢复真实 token 不会同步清理 stale offline 标记。
- 该状态下部分运行时路径可能仍把当前会话视为 offline demo，导致 HTTP 层跳过真实员工接口。

## 处理
- 在缓存用户恢复阶段，如果 token 不是 demo token，清理 offline demo 标记。

## 状态
- 已关闭。

