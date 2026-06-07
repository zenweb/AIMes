# ChatPanel 真实浏览器证据刷新

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/chat/ChatPanel.vue`
- 证据类型：项目 Playwright Chromium e2e
- 目标：确认 AI 生产助手在生产构建下的真实浏览器路径仍可用，避免只依赖单测或组件级模拟。

## 当前证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/chat.spec.ts
```

结果：

- Nuxt production build 成功。
- Chromium 执行 `tests/e2e/chat.spec.ts`。
- 32/32 passed。
- 覆盖路径包括：打开/关闭助手、发送问答、来源展开、导航动作、CSV 导出、异常处置卡、交期恢复执行包、工程约束复核包、客户承诺包、BOM 齐套包、设备停机复核包，以及多条业务问答证据链。
- 最大 JS chunk：817.50 kB。

## 结论

`ChatPanel` 当前已有真实浏览器证据，且现有 e2e 对用户关键路径的覆盖密度较高。继续围绕该组件做微切片的边际收益低于转向低覆盖且用户必经的组件。

## 发布闸门

本证据只关闭 A 轨质量打磨中的 `ChatPanel` 浏览器证据刷新，不关闭 B 轨发布闸门。Hosted CI、PostgreSQL/staging 演练、Attack Chain 人工签核、安全签字、首次灰度和 14 天 P0/P1 观察窗口仍未由本报告证明。
