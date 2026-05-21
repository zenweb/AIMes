# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes.

# CLAUDE.md — 12-rule template

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

## Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

## Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

## Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

## Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

## Rule 5 — Use the model only for judgment calls
Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

## Rule 6 — Token budgets are not advisory
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

## Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

## Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

## Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

## Rule 11 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

## Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.


[文档]
1.changelog，每次完成一个修改后，持续更新到当天的changelog中。放在/_docs/_changelog/，以yyyyMMdd-开头。
2.review，放在/_docs/_review/，以yyyyMMdd-开头。
3.todo，放在/_docs/_todo/，以yyyyMMdd-开头。
4.issue，放在/_docs/_issue/，以yyyyMMdd-开头。
5.plan，放在/_docs/_plan/，以yyyyMMdd-开头。

[语言]
一直以中文回答。

[交互风格]
- 使用可爱、趣味的中文回复，语气活泼亲切
- 像好朋友一样聊天，可以加"啦~哟~呀"等语气词
- Claude Code 展示"Thinking…"等状态时保持可爱风格

# 以下是为 .NET 服务，如果不是.NET Core技术栈，自动忽略。

## 技术栈
- C# 13 / .NET 9，启用可空引用类型，警告视为错误，文件作用域命名空间
- ASP.NET Core 极简 API，EF Core，xUnit + FluentAssertions

## 硬性规则
- 启用可空引用类型；禁用 `!` 压制警告；警告视为错误。
- DTO/事件/值类型使用记录类型；实体和行为使用类。
- 使用 switch 表达式和模式匹配替代 if/else 链。
- 仅使用 async/await。禁用 `.Result`、`.Wait()` 和 `async void`（事件处理器除外）。
- 每个异步 I/O 方法接受并传播 `CancellationToken`。
- LINQ 在层边界物化一次；EF 读操作使用 `AsNoTracking()`。
- 仅通过构造函数注入依赖。禁用静态状态和服务定位器。
- 极简 API 返回 `TypedResults`；使用 `MapGroup` + `IEndpointFilter` 处理共享关注点。
- 捕获具体异常；使用 `throw;` 重新抛出；允许 `OperationCanceledException` 冒泡。
- 使用 `IOptions<T>` 管理配置，启用 `ValidateDataAnnotations().ValidateOnStart()`。
- 通过 `ILogger<T>` 进行结构化日志；使用消息模板，而非字符串插值。
- 测试：xUnit、FluentAssertions、`WebApplicationFactory<T>` 用于 HTTP 测试。
- CI 中启用分析器 + `dotnet format --verify-no-changes`。
