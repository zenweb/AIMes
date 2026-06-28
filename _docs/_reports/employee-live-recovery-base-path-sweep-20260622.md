# Employee live recovery base-path sweep - 2026-06-22

## Scope

Checked for remaining runtime hardcoded Employee live-backend recovery links after the base-path-safe fix.

## Commands

```text
rg -n "/scheduling/login\?offlineDemo=0&redirect=/employee\?offlineDemo=0|切换在线后端|liveBackendRecoveryHref|appAssetPath\('login\?offlineDemo=0" src/frontend/src src/frontend/middleware -S
```

Result:

```text
src/frontend/src/components/employee/EmployeeBoard.vue:13:      <a class="btn btn-live" :href="liveBackendRecoveryHref">切换在线后端</a>
src/frontend/src/components/employee/EmployeeBoard.vue:190:const liveBackendRecoveryHref = appAssetPath('login?offlineDemo=0&redirect=/employee?offlineDemo=0')
```

```text
rg -n "href=\"/scheduling|href='/scheduling|location\.href\s*=\s*['\"]/scheduling|navigateTo\(['\"]/scheduling|window\.location.*scheduling" src/frontend/src src/frontend/middleware -S
```

Result:

```text
No matches.
```

## Conclusion

No additional runtime hardcoded `/scheduling` Employee recovery link remains in `src/frontend/src` or `src/frontend/middleware`.

The remaining expected references are:

- `EmployeeBoard.vue`: uses `appAssetPath(...)`.
- `employee-board.test.ts`: asserts default `/scheduling/` and custom `/factory/scheduling/` behavior.
- `ArchitectureRuleTests.cs`: guards the implementation and test tokens.
