# 2026-05-12 Changelog — 排程采纳反馈前端

## 变更清单

### 后端（4 文件）
- `_docs/_changelog/20260512-adoption-feedback.md` — 新增
- `src/MES.Application/DTOs/SchedulingDtos.cs` — 新增 `AdoptionFeedbackRequest` DTO（含必填校验）
- `src/MES.Domain/Interfaces/Repositories/IScheduleRepository.cs` — 新增 `SaveFeedbackAsync`
- `src/MES.Infrastructure/Repositories/ScheduleRepository.cs` — 实现 `SaveFeedbackAsync`（EF Core 持久化）
- `src/MES.Application/Services/SchedulingAppService.cs` — 接口 + 实现 `RecordAdoptionFeedbackAsync`；注入 `AdoptionFeedbackService`
- `src/MES.Api/Controllers/SchedulingController.cs` — 新增 `POST /api/v1/scheduling/adoption-feedback` 端点

### 前端（3 文件）
- `frontend/src/components/gantt/FeedbackForm.vue` — 新增采纳反馈弹窗组件（原因分类下拉 + 详情文本框 + 错误处理）
- `frontend/src/components/gantt/GanttToolbar.vue` — 新增「采纳反馈」按钮（紫色主题）
- `frontend/src/components/schedule/ScheduleBoard.vue` — 集成 FeedbackForm，`@feedback` 事件绑定
- `frontend/src/api/scheduling.ts` — 新增 `AdoptionFeedbackRequest` 类型 + `submitAdoptionFeedback` API 函数

## 验证
- 后端 `dotnet build` — 0 errors
- 前端 `vue-tsc --noEmit` — 0 errors
- 前端 `vite build` — 构建成功
- E2E: Scheduling 9/9 ✅（工具栏新增按钮不影响现有测试）
