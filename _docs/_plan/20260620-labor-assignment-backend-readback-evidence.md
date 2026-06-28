# Plan: 人员替班/资质阻断后端 Readback 证据补强

## 成功标准
- 确认后端端点存在。
- 确认服务层能写入人员替班/资质阻断 EvidenceLink 和 AuditLog。
- 确认 API 集成测试覆盖 upsert/query/readback。
- 如 Docker 可用，补真实容器 readback；如果不可用，明确记录阻断。

## 执行
1. 查询 Docker 状态。
2. 搜索后端 endpoint/service/test 落点。
3. 跑服务层人员证据单元测试。
4. 跑执行证据 API 集成测试。
5. 记录 Docker live readback 缺口和当前可用证据。

## 状态
- 后端单元/集成证据已补。
- Docker live readback 未完成。
