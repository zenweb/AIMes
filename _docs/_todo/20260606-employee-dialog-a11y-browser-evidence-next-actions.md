# 2026-06-06 EmployeeBoard 员工弹窗语义 Next Actions

## 下一步

- 员工页鼠标点击拦截、编辑弹窗 Escape 关闭/回焦、新增员工弹窗 Escape 关闭/回焦均已有 Chromium 证据；后续若继续人员域，优先审计完整焦点陷阱。
- 继续按覆盖率杠杆选择低覆盖且用户必经的既有组件。
- 不新增人员功能，继续硬化现有关键路径。

## 发布 B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
