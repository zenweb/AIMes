# 20260514 — OnnxInferenceService.LoadModelAsync 编译错误修复

## 问题

`OnnxInferenceService.LoadModelAsync` 返回 `Task<InferenceSession>`，与接口 `IOnnxModelService.LoadModelAsync` 要求的 `Task<bool>` 不匹配，导致编译失败：

```
error CS0029: 无法将类型"Task<InferenceSession>"隐式转换为"Task<bool>"
```

## 根因

原代码用 `.ContinueWith(t => t.Result != null, ct)` 做类型映射（`InferenceSession → bool`）。
本次 diff 删除了 `.ContinueWith` 但未补回类型转换，接口契约直接破裂。

## 修复

`src/backend/MES.AI/Services/OnnxInferenceService.cs:69`

改为 async/await 形式，符合 CLAUDE.md 硬性规则（禁用 `.Result`、`.Wait()`）：

```csharp
public async Task<bool> LoadModelAsync(string modelName, CancellationToken ct = default)
{
    var session = await GetOrLoadModelAsync(modelName, ct);
    return session != null;
}
```

## 追加修复（Review 第二轮）

Claude 对抗性子 Agent + Codex 均发现 `GetOrLoadModelAsync` 接受 `ct` 但从不检查它。
在 `GetOrLoadModelAsync` 开头加 `ct.ThrowIfCancellationRequested()`，使所有调用路径
（`PredictAsync`、`PredictMultiClassAsync`、`LoadModelAsync`）在进入阻塞的 `new InferenceSession(...)` 前先响应取消。

## 验证

`dotnet build MES.AI.csproj -p:NuGetAudit=false` → 0 警告 0 错误（两次修复后均通过）
