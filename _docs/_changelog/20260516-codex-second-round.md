# 20260516 — Codex 第二轮验证 + 收尾

## 背景

Codex 第二轮（option C 二次执行）验证了第一轮 6 项修复 + 找回归。结论：**3 pass / 2 partial / 1 fail**。

但 Codex 拿到的源码是部分快照——FIX-5 在 Codex 跑期间我已主动用 `IsNullOrWhiteSpace` 修了 ServiceCollectionExtensions + MesDbContextFactory。Codex 的 fail 是真问题，但只剩 Program.cs:190 健康检查路径漏一处。

## Codex 验证结果

| 项 | Codex 判定 | 评估 |
|---|---|---|
| FIX-2 Onnx Lazy 异常清除 | ✅ Pass | `TryRemove(KeyValuePair)` race-safe |
| FIX-4 AuditRedaction visited | ✅ Pass | finally remove 正确 |
| FIX-6 LoginPage placeholder | ✅ Pass | 已主动修 |
| FIX-1 移除 EnableRetryOnFailure | ⚠️ Partial — retry 韧性回归 | 真 trade-off，已记 P2-7 |
| FIX-3 ForwardedHeaders gated | ⚠️ Partial — 默认 false 时反代后桶折叠 | 文档警告强化 |
| FIX-5 空串 `??` 失效 | ❌ Fail（基于旧快照） | 已修 + 补健康检查路径 |

## 立即修复

### 补 FIX-5 遗漏点 ✅

**问题**：`Program.cs:190` 健康检查 `AddNpgSql(GetConnectionString("DefaultConnection")!)` 用 `!` 强制把空串传给 Npgsql 探针，启动后健康检查会持续报错而不是 fast fail。

**修复**：`Program.cs:186-203` 检查空串，缺失则 throw（Production 模式必须显式提供）。

### FIX-3 文档警告强化 ✅

**问题**：默认 `Aimes:TrustForwardedHeaders=false` 是安全默认（防 IP 伪造），但在反代后会让登录速率限制把整个工厂折叠成同一个网关 IP 桶——任何员工触发限速则全员被锁。

**修复**：`_docs/quickstart.md` 生产部署清单增强警告。

## 验证

```
dotnet build → 0 警告 0 错误
dotnet test  → 239 / 0 失败
```

## 完整会话产出统计

```
3 轮评审：原始 review + Codex 第一轮 + Codex 第二轮
18 项原 plan + 5 项 Codex 第一轮新发现 + 1 项 Codex 第二轮新发现 = 24 项
17 项已修 + 7 项推 P2 TODO
2 个文件路径漏修补回（FIX-5 健康检查 / quickstart 文档）
1 项 partial（FIX-1 retry 是设计 trade-off，需要重写 IUnitOfWork API 才能补）
```

## ROI 复盘

```
评审             | 时间   | 真实问题  | False alarm
原始 review      | ~30min | 11 项已修 | 0
Codex 第 1 轮    | ~3min  | 6 项 P0/P1| 1（已自修）
Codex 第 2 轮    | ~3min  | 3 项收尾  | 0
```

跨模型三轮评审最终确认 push 前清单可以收尾。后续仅剩 P2（push 后 30 天）。

## 关键发现：每轮 Codex 评审都抓到不同层次问题

- **第 1 轮**：源码层架构问题（Lazy 异常缓存、retry 与事务冲突、信任所有代理）
- **第 2 轮**：第 1 轮修复的边角 case（空串 vs null、健康检查路径漏、retry 撤销的副作用）

第二轮 Codex 评审 ROI 仍正——它找到了 P1 级别的健康检查路径漏修，靠肉眼很容易漏。

## 不再继续第三轮

第二轮 3 项 partial/fail 全部收尾后，**真问题已全部识别 + 处置**（修复 / 推 P2）。第三轮 Codex 评审预期主要是 false alarm 和文档润色级别 noise，ROI 已显著下降。

## 文件变更

- `src/backend/MES.Api/Program.cs` — 健康检查空串守卫 + ForwardedHeaders 已 gated
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs` — IsNullOrWhiteSpace（修了 Codex Fail）
- `src/backend/MES.Api/MesDbContextFactory.cs` — IsNullOrWhiteSpace（修了 Codex Fail）
- `_docs/quickstart.md` — TrustForwardedHeaders 警告强化
