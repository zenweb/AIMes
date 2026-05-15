# 20260515 — Pre-Launch DX 待办（待在 Docker 机器上执行）

> **背景**：开发机无 Docker 空间，本份 TODO 是搬到另一台有 Docker 的机器后的完整 runbook。
> **前置**：先把当前 V1 分支的 commit `aa6d027` 同步过去（见第 0 步）。
> **预计工时**：人工 1.5 小时 + CC 协作 1 小时 ≈ 2.5 小时跑完全部。

---

## 0. 在 Docker 机器上同步代码

```bash
# 方式 A：从 GitHub（如已 push）
git clone https://github.com/YOUR_ORG/aimes.git
cd aimes/v1
git checkout V1

# 方式 B：从开发机直接拷（未 push 时）
# 在 Docker 机器上：
git clone /path/to/dev-machine/AIMes/v1 aimes-v1
cd aimes-v1
```

确认到位的 2 个 commit：

```bash
git log --oneline -3
# 应看到：
#   aa6d027 feat(dx): Pre-Launch DX 配套 ...
#   0ebe392 fix(MES.AI): OnnxInferenceService ...
#   88d60b2 Place the solution file with the backend projects
```

---

## 1. 实跑 docker compose，验证 funnel 杀手修复 [必做]

**目的**：验证 Swagger Production 启用 + HttpsRedirection 关闭这两条修复在干净环境真的有效。

```bash
docker compose down -v   # 清干净
docker compose up -d
docker compose ps        # 等 5 个容器都 (healthy)
```

**Acceptance（每条都要过）**：

- [ ] `docker compose logs api 2>&1 | grep "AIMes V1"` 看到 ASCII 启动横幅
- [ ] `curl -sI http://localhost:5000/` 返回 `302 Found` 跳到 `/scheduling/`（**不是 307 跳 https**）
- [ ] `curl -sI http://localhost:5000/swagger` 返回 `301`（跳 `/swagger/index.html`）或 `200`，**不是 404**
- [ ] 浏览器打开 `http://localhost:5000` 自动跳到登录页
- [ ] `admin / admin@123` 登录后看到带演示数据的甘特图
- [ ] 实测从 `git clone` 到看到甘特图的总时间，记录在表里：

```
TTHW 实测记录：
  环境：[Linux x86_64 / Mac arm64 / Win WSL2]
  Docker 版本：[docker version 输出]
  网速：[首次拉镜像耗时 X 分钟]
  总耗时：[N 分 M 秒]
  目标：≤ 5 min
```

**如果哪条不过**：按 `_docs/troubleshooting.md` 排查，把新发现的问题加进去。

---

## 2. 截图素材 [必做，~30 分钟]

**目的**：README、自媒体文章、`_docs/screenshots/` 都需要这套素材。没截图，README 视觉冲击力直接打骨折。

### 截图清单

| 文件名 | 路径 | 内容 |
|---|---|---|
| `01-login.png` | `/login` | 登录页（admin 账号密码留空截图） |
| `02-scheduling-gantt.png` | `/scheduling/` | 排程甘特图（含瓶颈高亮+冲突闪烁的瞬间） |
| `03-production-board.png` | `/dashboard/production` | 生产概览仪表盘 |
| `04-spc-chart.png` | `/quality/spc` | SPC 控制图（带运行规则告警） |
| `05-riskboard.png` | `/dashboard/risk` | 风险预警看板（4 类风险都有数据） |
| `06-equipment.png` | `/equipment` | 设备状态列表 |

**规格**：

- 1920 × 1080，2x DPI 截图（Mac: `Cmd+Shift+5` 选区域；Windows: ShareX 或 PicPick）
- 浏览器全屏，去掉地址栏（Chrome `F11`）
- 演示数据要"看起来在工作"（瓶颈、告警、冲突都有内容，不要空表）
- 中文字体清晰

### GIF 录制（可选但强推荐）

录一段 5–10 秒甘特图操作 GIF（拖拽工单 → 看到约束验证响应）：

- Mac: [Kap](https://getkap.co/) 或 LICEcap
- Windows: [ScreenToGif](https://www.screentogif.com/)
- 输出：`_docs/screenshots/02-scheduling-gantt.gif`，≤ 5 MB

### 提交

```bash
git add _docs/screenshots/
git commit -m "docs: add product screenshots for README

含登录/甘特图/生产看板/SPC/RiskBoard/设备 6 张截图。
README 第一屏视觉冲击力到位，自媒体文章可复用。"
```

---

## 3. 替换商业版联系方式占位 [必做，~5 分钟]

**目的**：1/10 转化 funnel 命门。占位不替换 = 无法转化。

打开 `_docs/commercial-vs-opensource.md`，找到底部「联系方式」段，替换：

| 占位 | 替换为 |
|---|---|
| `YOUR_EMAIL@example.com` | 真实商务邮箱 |
| `YOUR_WECHAT_OFFICIAL` | 公众号名 |
| `YOUR_WECHAT_ID` | 商务微信号 |

同步检查：

- `README.md` 维护策略段是否需要加联系入口
- 如有公众号二维码，放 `_docs/screenshots/wechat-qr.png` 并在文档里引用

```bash
git add _docs/commercial-vs-opensource.md README.md _docs/screenshots/wechat-qr.png
git commit -m "docs: replace commercial contact placeholders with real info"
```

---

## 4. 看板顶部商业版 CTA banner [推荐，~30–60 分钟]

**目的**：评估人在产品里看到「这玩意还能多干嘛」，是 1/10 funnel 的第二触点（第一触点是 README CTA）。

### 实施

新建 `src/frontend/src/components/CommercialBanner.vue`：

```vue
<template>
  <div v-if="visible" class="commercial-banner">
    <span>💡 想要 LLM 多目标 Pareto 优化、自学习、私有部署？</span>
    <a :href="ctaLink" target="_blank">查看商业版 →</a>
    <button @click="dismiss" aria-label="关闭">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'aimes:commercial-banner-dismissed'
const visible = ref(false)

const ctaLink = 'https://github.com/YOUR_ORG/aimes/blob/main/v1/_docs/commercial-vs-opensource.md?utm_source=opensource&utm_medium=banner&utm_campaign=v0.1'

onMounted(() => {
  visible.value = localStorage.getItem(STORAGE_KEY) !== '1'
})

function dismiss() {
  localStorage.setItem(STORAGE_KEY, '1')
  visible.value = false
}
</script>

<style scoped>
.commercial-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: linear-gradient(90deg, #fff8e6 0%, #fff3d6 100%);
  border-bottom: 1px solid #f0d99c;
  font-size: 13px;
  color: #5b3d00;
}
.commercial-banner a {
  color: #b86b00;
  font-weight: 600;
  text-decoration: none;
}
.commercial-banner a:hover {
  text-decoration: underline;
}
.commercial-banner button {
  margin-left: auto;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #8a6a00;
}
</style>
```

挂到主布局：在 `src/frontend/src/layouts/MainLayout.vue`（或对应主布局组件）的最顶部插入 `<CommercialBanner />`。

### 验证

```bash
cd src/frontend && npm run build
docker compose build api && docker compose up -d
# 浏览器打开 /scheduling/，应看到顶部黄底 banner
# 点 × 关闭 → 刷新仍隐藏（localStorage 生效）
# 清 localStorage → banner 重现
```

```bash
git add src/frontend/
git commit -m "feat(frontend): add commercial CTA banner with localStorage dismiss"
```

---

## 5. ProblemDetails 错误码 + docUrl [推荐，~30 分钟]

**目的**：评估期遇到 400/403 时能搜文档，提升首次评估留存。

### 实施步骤

**步骤 1**：新建 `src/backend/MES.Domain/Errors/ErrorCode.cs`：

```csharp
namespace MES.Domain.Errors;

/// <summary>
/// 标准错误码。前缀分组方便文档检索。
/// </summary>
public static class ErrorCode
{
    // 认证相关
    public const string AuthInvalidCredentials = "AIMES-AUTH-001";
    public const string AuthTokenExpired = "AIMES-AUTH-002";
    public const string AuthTokenRevoked = "AIMES-AUTH-003";
    public const string AuthRateLimited = "AIMES-AUTH-004";

    // 验证相关
    public const string ValidationRequired = "AIMES-VAL-001";
    public const string ValidationFormat = "AIMES-VAL-002";
    public const string ValidationRange = "AIMES-VAL-003";

    // 排程相关
    public const string SchedulingStateConflict = "AIMES-SCH-001";
    public const string SchedulingConstraintFailed = "AIMES-SCH-002";

    // 资源相关
    public const string ResourceNotFound = "AIMES-RES-001";
    public const string ResourceConflict = "AIMES-RES-002";

    public const string DocBaseUrl = "https://github.com/YOUR_ORG/aimes/blob/main/v1/_docs/troubleshooting.md";

    public static string DocUrlFor(string code) => $"{DocBaseUrl}#{code.ToLowerInvariant()}";
}
```

**步骤 2**：扩展 `src/backend/MES.Api/Middleware/ExceptionMiddleware.cs`，在 `ProblemDetails.Extensions` 里加 `code` 和 `docUrl`：

```csharp
problem.Extensions["code"] = errorCode;
problem.Extensions["docUrl"] = ErrorCode.DocUrlFor(errorCode);
```

具体识别哪种异常映射到哪个 code 看现有 switch 分支扩展。

**步骤 3**：在 `_docs/troubleshooting.md` 底部追加错误码索引段，每个错误码加一个带 `#aimes-auth-001` 风格 anchor 的小节，描述：问题 + 原因 + 修复。

### 验证

```bash
docker compose up -d
# 故意触发 400：
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":""}'
# 期望返回的 JSON 含：
#   "code": "AIMES-VAL-001"
#   "docUrl": "https://.../troubleshooting.md#aimes-val-001"
```

```bash
cd src/backend/MES.Api && dotnet build  # 应 0 错 0 警告
git add src/
git commit -m "feat(api): ProblemDetails 加 errorCode + docUrl 字段

定义 ErrorCode enum，覆盖 Auth/Validation/Scheduling/Resource 4 大类。
ExceptionMiddleware 输出 ProblemDetails 时附加 code + docUrl，
评估人遇到错误能直接搜文档。troubleshooting.md 加错误码索引段。"
```

---

## 6. 跑 pre-launch-cleanup.sh [push 前必做]

**前置**：上面 1–5 完成、所有改动都已 commit。

```bash
# 先 dry-run 看一遍要清什么
bash scripts/pre-launch-cleanup.sh --dry-run

# 对比清单确认没有误伤后，正式跑
bash scripts/pre-launch-cleanup.sh

# 检查变更
git status
# 应看到大量 deleted: _docs/_changelog/* / _docs/_review/* / _docs/_research/* / _docs/_plan/*
# 以及 modified: .gitignore

git add -A
git commit -m "chore: pre-launch cleanup of internal docs

把 _changelog/_review/_research/_plan 从 git index 移除（文件保留磁盘），
.gitignore 追加规则防止未来不小心追踪。

清理后 GitHub 视图只保留：
  CHANGELOG.md（顶层用户面）
  _docs/{quickstart,troubleshooting,commercial-vs-opensource}.md
  _docs/_design/aimes-design-doc.v1.md（架构对外）
  _docs/screenshots/
  _docs/SOP.md"
```

---

## 7. 仓库布局决策 [push 前必决定]

**问题**：GitHub 仓库根是 `AIMes/`（含 `v1/ v2/ Tmom/`）还是 `AIMes/v1/`？

### 选项 A：仓库根 = `AIMes/`

- 保持现状，`v1/` `v2/` 并存
- README 显示在 GitHub 首页要再写一份在 `AIMes/README.md`，引导到 `v1/`
- 评估人 clone 完要 `cd v1` 才能 `docker compose up`
- ✅ 适合：未来 v2 也开源
- ❌ 缺点：评估人多一步 cd，README 要维护 2 份

### 选项 B：仓库根 = `AIMes/v1/`

- 仅把 v1 推到 GitHub，v2/Tmom 留本地或私仓
- 评估人 clone 完直接 `docker compose up`
- ✅ TTHW 直接少 1 步
- ❌ 未来 v2 开源要新建 repo

### 推荐

**选 B**（v1 是仓库根），TTHW 优先。

执行（如选 B）：

```bash
# 在另一台机器上，从 v1 子目录创建独立 repo：
cd /path/to/AIMes/v1
# 当前 v1/.git 已存在（你看到的 git log），直接当独立 repo 用
git remote add origin https://github.com/YOUR_ORG/aimes.git
# push 前还要确认 .github/workflows/ci.yml 里的 working-directory 是否要改
```

如选 A，需要在 `AIMes/` 下额外初始化一个 super-repo，做 `git submodule` 或者 `git subtree`，复杂度高得多。

---

## 8. 试 push 到私仓 [推荐]

**目的**：先在私仓走一遍完整流程（push → GitHub 渲染 → 评估人视角自检），再决定公开。

```bash
# 在 GitHub 创建私仓 YOUR_ORG/aimes-private（先别用 aimes 这个公开名）
git remote add origin https://github.com/YOUR_ORG/aimes-private.git
git push -u origin V1
```

**渲染自检清单**：

- [ ] README badges 全部正常显示
- [ ] 截图加载正常（路径 `_docs/screenshots/01-login.png` 等）
- [ ] LICENSE 在 GitHub 右栏正确识别为 "Apache-2.0"
- [ ] CHANGELOG.md 链接到内部文档不爆链
- [ ] `commercial-vs-opensource.md` 的 UTM 链接可点击
- [ ] 内部 `_changelog/_review/_research/_plan` 在 GitHub 看不见（已被 .gitignore）
- [ ] 找一个不知情同事 clone + docker compose up 实测 5min TTHW

如有问题修完，再迁移到公开 repo。

---

## 9. 公开 push + 自媒体文章联动 [最后一步]

```bash
# 把私仓改名 / 重建公开 repo
git remote set-url origin https://github.com/YOUR_ORG/aimes.git
git push -u origin V1:main   # 把 V1 分支推为 main
```

公开 push **当天**做：

- [ ] 给 v0.1.0 打 git tag：`git tag -a v0.1.0 -m "首次开源发布" && git push origin v0.1.0`
- [ ] GitHub Releases 创建 v0.1.0，从 CHANGELOG 复制内容
- [ ] 自媒体文章发布，链接 + UTM 参数：`?utm_source=wechat&utm_medium=article&utm_campaign=v0.1-launch`
- [ ] 准备公众号留言/邮箱回复模板（首批咨询会涌进来）

---

## 完成度判定

完成下列**全部**才算 push 准备就绪：

- [ ] **第 1 步** docker compose 实测 5min TTHW 达标
- [ ] **第 2 步** 6 张截图（含 GIF）就位并 commit
- [ ] **第 3 步** 商业版联系方式真实信息已替换
- [ ] **第 4 步** 看板 CTA banner 上线（可选但强推荐）
- [ ] **第 5 步** ProblemDetails 错误码就位（可选）
- [ ] **第 6 步** pre-launch-cleanup.sh 已执行并 commit
- [ ] **第 7 步** 仓库布局决定
- [ ] **第 8 步** 私仓试 push + 评估人视角自检通过

不阻塞 push 但 push 后 30 天内必做：见 `_docs/_plan/20260514-pre-launch-checklist.md` 底部「Push 后 30 天 TODO」。

---

## 相关文档

- 完整 push 前清单：`_docs/_plan/20260514-pre-launch-checklist.md`
- 上批工作经过：`_docs/_changelog/20260514-pre-launch-dx-batch1.md`
- 提交落地经过：`_docs/_changelog/20260515-pre-launch-commits.md`
- 故障排查：`_docs/troubleshooting.md`
- 商业版边界：`_docs/commercial-vs-opensource.md`

---

*本 TODO 在 Docker 环境跑完后，建议 commit 一份执行结果回填到 `_docs/_changelog/yyyymmdd-pre-launch-execution.md`，标注每步实际耗时和发现的偏差，作为下次 release 的参考。*
