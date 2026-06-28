# 2026-06-11 Todo: Staging Rehearsal 后续

## 已完成

- Docker Desktop/Linux Engine 当前可用性确认。
- Staging rehearsal 当前 PASS：`_docs/_reports/staging-rehearsal-20260611-current.md`。
- Docker 修复后复跑 staging rehearsal 当前 PASS：`_docs/_reports/staging-rehearsal-20260611-docker-restored.md`。
- 后端测试基线通过：Unit 434、Architecture 85、Evaluation 2、Integration 175。
- Release gate audit 已刷新：`_docs/_reports/release-gate-audit-20260611-after-staging-recheck.md`。
- Docker-restored release gate audit 已刷新：`_docs/_reports/release-gate-audit-20260611-after-docker-restored-staging-rerun.md`。
- 当前人工签字/Attack Chain transcript 入口默认引用 Docker-restored staging 证据：`_docs/_reports/staging-rehearsal-20260611-docker-restored.md`。

## 下一步

- 人工验证 Attack Chain A/B/C，并把 verifier、VerifiedAt 和 A/B/C evidence 写入对应报告。
- 完成 security signoff；必须由人类 signer 修改签字状态。
- 启动首次 gray release，开始 14 天 P0/P1=0 观察窗口。
- 继续保持质量打磨轨道按覆盖率杠杆选片，但不得用测试绿灯替代人工发布闸门。
