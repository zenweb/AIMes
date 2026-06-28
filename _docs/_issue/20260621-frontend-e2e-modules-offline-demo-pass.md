# Issue - Frontend E2E Modules Offline Demo Pass

## Status
- Closed for the smoke scope.

## Problem
- 离线 demo 入口过去容易把 backend skip 或后端不可用细节直接暴露给用户。

## Evidence
- 当前 `modules.spec.ts` 对 12 个模块入口执行真实浏览器 smoke。
- Result: 12/12 passed.

## Remaining Outside Scope
- 每个模块的深层业务动作仍需各自 e2e 或单测证明。
