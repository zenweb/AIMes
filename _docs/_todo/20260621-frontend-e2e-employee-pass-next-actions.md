# 2026-06-21 Todo - Employee E2E Next Actions

## 下一步

- 继续全站真实浏览器证据 sweep，优先检查仍可能出现离线 demo backend skip 文案的模块。
- 对 e2e helper 做一次轻量抽取，避免其它 spec 重复踩 demo/live mock session 混用问题。
- 全站 e2e 前清理或隔离历史 Node/Nuxt 预览进程，避免端口 4173/4174/4175 干扰。

## 注意

- 不要把员工 e2e 单片 PASS 误记为发布闸门 strict PASS。
- hosted CI 仍需覆盖当前 dirty worktree 后才能提升整体发布可信度。
