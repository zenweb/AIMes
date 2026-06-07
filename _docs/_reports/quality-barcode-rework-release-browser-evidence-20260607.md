# QualityBoard 扫码返工复验放行真实浏览器证据

日期：2026-06-07

## 目标

补齐质量闭环中“扫码返工复验放行进入审计回放和 OTD 复盘”的真实 Chromium 证据：返工复验放行必须生成质量门释放证据，并进入审计回放和报表 OTD 复盘，不能只停留在质量页本地状态。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`扫码返工复验放行进入审计回放和 OTD 复盘`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码返工复验放行进入审计回放和 OTD 复盘"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\quality.spec.ts:590:3 › Quality 质量闭环 › 扫码返工复验放行进入审计回放和 OTD 复盘 (2.4s)
1 passed (7.5s)
```

验证点：

- 真实 Chromium 执行扫码返工复验放行路径。
- 质量页生成质量门释放证据。
- 质量放行证据进入审计回放。
- 报表页 OTD 复盘展示该质量释放链路。
- 本轮与 `quality-barcode-release-write-failure-browser-evidence-20260607.md` 形成正向成功和写入失败两侧证据。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整 quality e2e 文件。
- 未覆盖后端 PostgreSQL/staging 持久化环境中的真实数据库读写。
- Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
