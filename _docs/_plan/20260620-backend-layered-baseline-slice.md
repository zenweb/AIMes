# Plan: 后端分层基线切片

## 成功标准
- 在当前 shell 下确认 Docker 是否可用于 live readback。
- 用 `/p:SkipFrontendBuildCopy=true` 跑通 Architecture / Unit / Integration 三类代表性后端测试。
- 清楚记录过滤范围，不把切片误报为全量基线。

## 执行
1. 查询 Docker API 状态。
2. 串行运行后端 Architecture 切片。
3. 串行运行后端 Unit 切片。
4. 串行运行后端 Integration 切片。
5. 写入五类文档。

## 状态
- 已完成本片。
