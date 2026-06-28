# 2026-06-20 Todo - Schedule current 生产/演示 seed 后续

## 下一步
- 将 `db/ensure-current-schedule-plan.sql` 纳入 staging rehearsal 或本地恢复 SOP，避免已有 volume 跳过 `db/seed.sql` 后再次出现 current plan 空洞。
- 决定 Docker compose 的 `Production` 环境是否应保留“只校验 schema，不自动 seed”的策略；如果保留，文档必须明确恢复脚本。
- 若要发布级闭环，应补一个启动/ready 检查：演示环境 current plan 为空时 fail loud，而不是让前端兜底。
- 继续用真实浏览器验证排产页：无 fallback warning、无 global toast、甘特图显示后端 current plan。

