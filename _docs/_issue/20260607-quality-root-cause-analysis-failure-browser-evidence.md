# 2026-06-07 Issue - 根因分析加载失败 Chromium 证据

## 问题

根因分析 API 失败已有单元测试覆盖，但缺少真实 Chromium 证据证明浏览器中分析请求失败时仍能展示 fallback 根因，而不是空面板或静默失败。

## 影响

如果该路径失败时没有 fallback，质量工程师会失去临时处置依据，影响 CAPA、隔离和预防措施判断。

## 处理

- 新增 e2e 关闭 offline demo，mock 无关质量 API 成功。
- 注入 `INS-ROOT-FAIL` 根因分析 503。
- 断言 alert 和 fallback 根因分析 dialog。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
