# 2026-06-12 Issue: live staging 排产拖拽证据红灯记录

## 已解决红灯

- 固定 `admin/admin123` 在当前 staging DB 不存在，导致登录 401。
  - 处理：live E2E 自建临时管理员，并用 API 兼容 PBKDF2 哈希。
- `live staging` grep 未关闭 demo hints，页面进入轻量 marker 模式。
  - 处理：E2E 启动脚本将 `live staging` 纳入真实 dhtmlx 路由。
- 初始 probe 任务落入 8 小时锁定期，dhtmlx 按业务规则拒绝拖拽。
  - 处理：probe item 调整到当前时间 10-14 小时后。
- 断言固定期待 PATCH 204，但真实端点返回 200。
  - 处理：以 2xx 成功码 + GET/DB 同窗作为硬证据。
- 工作台文案“正式排产计划已更新”只在 feedback 条件下出现，不适合作为 live 拖拽保存硬断言。
  - 处理：删除该弱断言，改用 API/DB 证据。

## 当前状态

- 无已知阻断项。
- 本片红灯均已收敛为测试数据或断言口径问题，未发现新的产品功能缺陷。
