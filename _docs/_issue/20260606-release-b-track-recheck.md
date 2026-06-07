# 2026-06-06 Issue：B 轨 release gate 仍被 GitHub remote 与 Docker 镜像通道阻断

## 现象

- `gh auth status` 显示 GitHub.com 登录成功，但当前 repo remote 指向 `https://git.code.tencent.com/zenweb/AIMes.git`。
- `gh repo view` / `gh run list` 无法确定 GitHub base repo。
- Docker Desktop daemon 已启动，但 `docker pull postgres:16-alpine` 仍因 Docker Hub HTTPS 访问超时失败。

## 影响

- Hosted CI gate 无法获得 GitHub Actions RunUrl、RunId、job summary evidence。
- PostgreSQL/staging rehearsal 无法启动依赖容器，也无法进入 EF migrations 和 `/live`、`/ready` 验证。
- v1.0.0 release gate 继续 FAIL。

## 处理

- 已生成最新 Hosted CI、staging 和 aggregate release gate 报告。
- 已修复 `run-staging-rehearsal.ps1` 的 Missing 模式诊断，避免本地镜像不存在时提前遮蔽真实 pull 失败。

## 状态

- 未关闭。
- 需要 GitHub remote/Actions evidence，以及 Docker Desktop 可用 HTTPS proxy/registry mirror 或预拉镜像。
