# 2026-06-12 Plan: 排产 live staging 真实 dhtmlx 证据

## 目标

补齐排产页“真实前端页面 + 真实 dhtmlx + 真实 API + PostgreSQL”的拖拽保存证据。

## 成功标准

- 关闭 offline demo 和轻量 marker。
- 浏览器显示真实 dhtmlx 任务条。
- 鼠标拖拽任务条触发 live API PATCH。
- 点击刷新后，GET read model 读回拖拽后的同一窗口。
- PostgreSQL 中同一排产项窗口与 GET read model 一致。
- 证据截图和 manifest 落盘。

## 执行结果

- 已新增 gated live E2E。
- 已重建并启动最新 API 容器，`/ready` 返回 Healthy。
- 已通过 live staging E2E，并保留截图/manifest。
- 已补跑既有真实 dhtmlx 回归，4 passed，live gated 用例 skipped。

## 保留边界

- 该计划只覆盖排产拖拽保存精品闭环，不代表 v1.0.0 发布总闸门完成。
- hosted CI、首次灰度、2 周无 P0/P1 观察窗口仍需沿发布轨道单独追。
