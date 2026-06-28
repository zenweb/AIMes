# Todo - Employee Preview Output Rebuild Next Actions

- 每次需要给用户可访问入口前，先确认当前 4173 预览进程已加载最新 `.output`。
- 对生产预览入口保留快速 smoke：访问 `/scheduling/employee?offlineDemo=1`，检查 `.emp-board` 可见、alert 为 0。
- 后续可把“构建后资源 manifest 与 `.output/public/_nuxt` 一致性检查”加入预览脚本，避免旧 chunk 缺失时只表现为空白页。
- 继续按覆盖率杠杆推进真实浏览器证据，不把本次预览产物问题误记为员工页业务逻辑缺陷。
- 2026-06-21 复验后保留此操作约束：前端源码或构建产物变化后，必须重启 `npm run preview` 所在的 4173 进程再给用户入口。
- 2026-06-21 二次复验后继续保留同一约束：给用户 4173 入口前，必须同时完成 build、preview restart、真实浏览器 smoke，不能只依赖源码单测。
- 2026-06-21 三次复验后继续保留同一约束：每次用户报告 4173 与源码验证不一致时，先查 preview 进程和 `.output` 更新时间，避免把旧包问题误判成业务代码缺陷。
