# Sprint 2 — 数据层合规 + Low 级别审计发现修复

> 完成 Sprint 2 全部 6 项任务
> 日期: 2026-05-14

---

## 完成项

### S2.1: CancellationToken 贯穿审计
- **状态**: ✅ 之前完成
- 所有 endpoint handlers 和 AppServices 正确传播 CancellationToken

### S2.2: if/else → switch 表达式重构
- **文件**: `frontend/src/components/chat/ChatPanel.vue`
- **改动**: `getDemoReply()` 6 分支 if/else 链 → 数据驱动的 `demoReplies` 查找表
- 使用 `Array.find()` + `keywords.some()` 匹配，默认回退保留

### S2.3: DTO 定义位置统一 (A12)
- **状态**: ✅ 之前完成 — DTO 已集中在 `Application/DTOs/` 目录

### S2.4: 前端 ESLint/Prettier 配置 (F3)
- **新建**: `.eslintrc.cjs`、`.prettierrc`（之前已创建）
- **安装**: `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-plugin-vue`, `vue-eslint-parser`
- **脚本**: `package.json` 添加 `lint` 和 `format` 命令

### S2.5: 生产环境 source map 配置 (F4)
- **状态**: ✅ 之前完成 — `vite.config.ts` sourcemap 设为 `'hidden'`

### S2.6: 日期格式器时区处理 (F13)
- **文件**: `frontend/src/utils/date.ts`
  - 新增 `formatGanttDate()` — dhtmlx-gantt 兼容的 `YYYY-MM-DD HH:mm` 格式，使用 `Intl.DateTimeFormat` + `Asia/Shanghai` 时区
- **文件**: `frontend/src/utils/gantt-mapper.ts`
  - 移除本地 `formatDate()` 函数，改为导入 `formatGanttDate` 共享工具函数
  - `ganttDateHelpers.toTaskDate()` 同步更新

---

## 验证结果

| 检查项 | 状态 |
|--------|------|
| `npm run build` | ✅ 成功 (0 错误) |
| `vue-tsc` 类型检查 | ✅ 通过 |
| gantt chunk 独立 | ✅ 732KB 独立 chunk |

## Sprint 2 完成状态

| 编号 | 描述 | 状态 |
|------|------|------|
| S2.1 | CancellationToken 贯穿 | ✅ 完成 |
| S2.2 | if/else → switch 重构 | ✅ 完成 |
| S2.3 | DTO 定义位置统一 | ✅ 完成 |
| S2.4 | ESLint/Prettier 配置 | ✅ 完成 |
| S2.5 | 生产 source map | ✅ 完成 |
| S2.6 | 日期时区处理 | ✅ 完成 |

---

**下一阶段**: Sprint 3（架构债 + 性能）待启动
