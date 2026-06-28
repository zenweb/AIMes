# Todo: 后端分层基线切片后续

## 已完成
- [x] Docker API 状态检查。
- [x] Architecture 代表切片通过。
- [x] Unit 代表切片通过。
- [x] Integration 代表切片通过。
- [x] 明确本片不是全量回归。

## 后续建议
- [ ] 串行跑更大的后端测试基线，继续使用 `/p:SkipFrontendBuildCopy=true`。
- [ ] Docker API 恢复后补 PostgreSQL/API live readback。
- [ ] hosted CI 跑当前 HEAD 后，把远端 run id/head sha 写入 release evidence。
