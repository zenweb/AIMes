# 2026-06-12 Issue：排产拖拽保存 staging 500 / GET 400

## 状态

已关闭。

## 现象

- 旧 staging probe：`PATCH /api/v1/scheduling/plans/{planId}/items/{itemId}` 返回 HTTP 500。
- 重建 API 镜像后：PATCH 返回 200，但 `GET /api/v1/scheduling/plans/{id}` 返回 HTTP 400。

## 根因

- PATCH 500：写路径从 no-tracking 排产聚合开始，在 PostgreSQL `xmin` 并发 token 下会触发并发更新风险。
- GET 400：`SchedulingAppService` 被解析时同步构造 `LlmGatewayService`，而 `LlmGatewayService` 构造函数立即 BuildKernel；生产环境默认 AzureOpenAI API key 为空，导致普通排产读接口失败。

## 修复

- 新增 `IScheduleRepository.GetByIdForUpdateAsync`，排产 reschedule 写路径使用 tracked 聚合。
- `LlmGatewayService` 改为 `Lazy<Kernel>`，只在实际 LLM/Embedding 调用时构造 Kernel。
- staging probe 验证 PATCH、PostgreSQL stored window、GET plan window 三者一致。

## 证据

- PostgreSQL/xmin 仓储测试：3 passed。
- 排产 API 集成测试：62 passed。
- staging rehearsal + reschedule probe：PASS。
