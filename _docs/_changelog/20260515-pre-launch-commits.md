# 20260515 — Pre-Launch DX 提交落地

## 提交概览

本会话工作以两个 commit 提交到 `V1` 分支：

```
aa6d027 feat(dx): Pre-Launch DX 配套 — README/LICENSE/CHANGELOG/quickstart/CTA
0ebe392 fix(MES.AI): OnnxInferenceService 类型不匹配 + CancellationToken 响应
```

未推送到远程（按默认安全策略，push 需明确指令）。

## Commit 1 — `0ebe392` 修复

| 项 | 说明 |
|---|---|
| 文件 | `src/backend/MES.AI/Services/OnnxInferenceService.cs` |
| P0 | `LoadModelAsync` 改 `async/await`，修接口 `Task<bool>` 类型不匹配编译错误 |
| 第二轮 | `GetOrLoadModelAsync` 加 `ct.ThrowIfCancellationRequested()`，让所有调用路径在阻塞模型加载前响应取消（Codex + Claude 对抗 review 一致发现） |
| 验证 | `dotnet build` → 0 警告 0 错误 |

详细经过见 `_docs/_changelog/20260514-onnx-loadmodel-fix.md`。

## Commit 2 — `aa6d027` Pre-Launch DX

11 个文件，1420 行新增。

### Funnel 杀手修复（Codex outside voice 发现）

| 杀手 | 修复 |
|---|---|
| `/swagger` 在 Production 模式 404 | `Program.cs` 加 `Aimes:EnableSwagger` 开关，`docker-compose.yml` 默认开启 |
| `http://localhost:5000` 被 307 跳到 https 翻车 | `Program.cs` 加 `Aimes:DisableHttpsRedirect` 开关，`docker-compose.yml` 默认关闭重定向 |

### DX 阻塞项

| # | 文件 | 性质 |
|---|---|---|
| 1 | `README.md` | GitHub 第一眼，含 badges + 5min quickstart + 截图占位 + 边界表 |
| 3 | `Program.cs` 启动横幅 | docker compose up 后第一眼看到登录 URL/账号/Swagger 入口 |
| 4 | `Program.cs` 根路径跳转 | `/` → `/scheduling/`，消除评估人猜路径 |
| 6 | `LICENSE` | Apache-2.0 完整文本 |
| 7 | `CHANGELOG.md` | v0.1.0 首次发布完整能力清单 |
| 9 | `_docs/quickstart.md` | 先决条件 + 端口表 + 5 分钟体验路径 |
| 10 | `_docs/troubleshooting.md` | 8 个高频启动问题诊断+修复 |
| 11 | `_docs/commercial-vs-opensource.md` | 功能边界对照 + CTA 落地页 |
| 12 | `scripts/pre-launch-cleanup.sh` | 内部产物清理脚本（dry-run 已验证识别 19 个文件） |

详细经过见 `_docs/_changelog/20260514-pre-launch-dx-batch1.md`。

## 评估指标

| 维度 | 提交前 | 提交后（估） |
|---|---|---|
| Overall DX | 3.75/10 | 7/10（截图就位后到 8/10） |
| TTHW（顺利） | 8 min | 5 min（预期，待实测） |
| TTHW（翻车） | ∞（评估人放弃） | 仍可能（取决于环境差异） |
| 阻塞 funnel 项 | 5 项 | 0 项（截图为软阻塞） |

## 工作区残留 untracked

下列文件保持 untracked，未提交（不属于本次工作产出）：

- `CLAUDE.md` — 项目级配置
- `_docs/_research/deep-research-report.md`
- `_docs/_research/深度扩展...docx`
- `_docs/_research/深度扩展...pdf`

由用户决定是否纳入版本控制。

## 仍待执行

转 `_docs/_todo/20260515-pre-launch-remaining.md`，含可在另一台机器执行的完整 runbook。
