# 2026-06-14 Review - Schedule 外协释放事件刷新

## Findings
- 外协释放成功后，`outsourcingCommitmentRecord` 已写入本地释放态，但随后的事件刷新会再次读取 backend-first 外协包。
- 当 backend-first 暂时返回同一 `sourceKpiId` 的旧“已到货”包时，事件队列会被回退，导致建议卡显示已释放、队列仍显示已到货。
- 修复后，当前内存里已有 `scheduleReleaseTraceId` 的同源包优先于旧读回结果，事件队列会刷新为“已释放”。

## Verification
- 单文件单测：`schedule-board.test.ts` 40 passed。
- 完整前端 coverage：105 files / 758 tests passed。
- 新测试断言事件标题、影响说明、窗口、resolution note、release trace 和 release audit 都进入队列。

## Residual Risk
- 本片是组件单元证据，未重新跑真实浏览器截图。
- 完整 coverage 命令仍输出既有 Node warning：`--localstorage-file` 未提供有效路径；该 warning 未导致测试失败。
