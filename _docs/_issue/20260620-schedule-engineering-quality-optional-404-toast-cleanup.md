# 2026-06-20 Issue - Schedule optional 工程/质量证据 404 弹 toast

## 现象
- `/scheduling/scheduling` 真实浏览器扫查中，多条 optional latest 证据接口返回 404，并触发全局 `请求错误 Request failed with status code 404` toast。

## 根因
- `engineeringEvidence.ts` 的 optional latest 读取未传 `suppressErrorToast`。
- `qualityEvidence.ts` 虽有 suppress toast，但 `failLoud` 场景下 404 仍会被继续抛出，导致暂无记录被当作真实失败。

## 处理
- 工程 optional latest 统一 suppress toast。
- 工程/质量 optional latest 统一先识别 404 并返回 `null`。
- 保留非 404 fail-loud 抛出行为。

## 状态
- optional 工程/质量 404 toast 已关闭。
- 核心 `/scheduling/current` 404 仍作为独立问题显性追踪。

