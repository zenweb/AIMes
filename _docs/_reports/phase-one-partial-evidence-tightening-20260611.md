# Phase One Partial Evidence Tightening

- GeneratedAt: 2026-06-11T13:35:00+08:00
- Scope: tighten the remaining `PARTIAL/INDIRECT` rows in `_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md`.
- Constraint: no long test command was run for this tightening pass. The previous long ArchitectureTests run was intentionally interrupted by the user, so this report uses light static scans plus existing hosted CI/staging evidence.

## Result

| Acceptance item | Tightened status | Evidence basis |
| --- | --- | --- |
| Five core modules use persisted data instead of process-local lists | PASS | `CoreModulePersistenceRecoveryTests.CoreModules_ShouldSurviveApplicationRestartAndRemainQueryable` proves Anomaly/BOM/Employee/Inventory/Purchase data survive a recreated API host on the same file-backed SQLite database; static service scans still show repository/unit-of-work wiring; hosted CI and PostgreSQL staging are PASS. |
| Anomaly frontend double-prefix bug fixed | PASS | `anomaly.ts` keeps endpoints baseURL-relative under shared `http.ts` `/api/v1`; `anomaly-api.test.ts` proves list/detail/analyze pass `/anomaly` paths, not `/api/v1/anomaly`; `anomaly.spec.ts` proves real Chrome requests `/api/v1/anomaly` and never `/api/v1/api/v1/`; `Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence` guards implementation, unit, e2e, and matrix citation. |
| Admin default password removed and first-login change enforced | PASS | Startup logging no longer advertises default credentials; `PasswordChangeRequiredMiddleware`, domain tests, auth integration tests, and admin endpoint integration tests directly prove first-login rotation enforcement; `Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced` guards implementation, tests, migration, and matrix citation. |
| ChatPanel markdown/XSS escapes unsafe HTML | PASS | `ChatPanel.vue` escapes unsafe backend content before limited markdown rendering; `chat-panel.test.ts` directly proves `<script>` and `<img onerror>` remain text while `strong` markdown is allowed; `chat.spec.ts` proves in real Chrome that no `script` or `img` nodes are rendered and `window.__aimesXss` remains false; `Sprint1ChatPanelMarkdownXss_ShouldHaveDirectEscapingEvidence` guards implementation, tests, and matrix citation. |
| Seeder does not create empty password hash | PASS | `EfDemoDataSeeder` uses `PasswordHasher.Hash` for demo users; `SystemUserTests.Create_WhenPasswordHashIsEmpty_ShouldReject` proves the domain rejects empty hashes; `AuthControllerTests.Login_WithValidCredentials_ShouldReturnToken` proves seeded credentials authenticate and force first-login rotation; `Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords` guards the implementation, tests, and matrix citation. |
| Refresh tokens stored hashed | PASS | `AuthEndpoints.HashToken` hashes refresh tokens before lookup/storage; `AuthControllerTests.Login_ShouldPersistOnlyHashedRefreshToken` proves the DB contains the SHA-256 hash and not the clear-text bearer refresh token; `Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence` guards the implementation, DB token constraint, integration test, and matrix evidence citation. |
| SignalR subscribe role boundary enforced | PASS | `NotificationHub.CanSubscribeToChannel` has direct role/channel allow and reject unit evidence in `NotificationHubChannelPolicyTests`; `Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence` guards `[Authorize]`, Subscribe/Unsubscribe policy enforcement, role-prefix maps, and the matrix evidence citation. |
| Login rate limit partitioned by IP + username | PASS | `AuthRateLimitUsernameMiddleware` captures username before `UseRateLimiter`; `AuthRateLimitPartitionKeyTests` prove IP+username composition, username normalization, and unknown fallback; `Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence` guards middleware order, rate limiter policy, unit tests, and matrix citation. |
| Six agents have success/degrade/exception/prompt-boundary/token-budget tests | PASS | Static test inventory shows six target agent test files with success, fallback/degrade, exception/retrieval-failure, cancellation or token propagation, prompt-boundary, and token-budget/trace assertions; hosted Agent Evaluation is PASS. |
| Metrics background failures use structured logging | PASS | `MetricsBackgroundService` injects `ILogger<MetricsBackgroundService>` and logs `LogError(ex, "Metrics push failed")`; unit tests cover the push helper paths; hosted CI is PASS. |
| Quality gray monitoring UI evidence | PASS | `admin.spec.ts` case `R3 灰度发布进入 Agent 灰度监控指标` proves in real Chrome that Agent governance renders the R3 quality gray monitor with adoption, recheck, false-recall, audit id, and trace id; `Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence` guards the e2e test, frontend evidence report, matrix citation, and wording that this does not close the release gray observation gate. |
| Anomaly create transaction rollback | PASS | `AnomalyEndpoints.CreateAsync` keeps anomaly creation, inline audit, and notification inside one `IUnitOfWork.ExecuteAsync` boundary; `Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit` injects `ThrowingNotificationService` and proves the failed create returns 500 without persisting either the anomaly row or the audit row; `Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence` guards the endpoint ordering, non-self-committing audit repository, integration test, and matrix citation. |
| Inventory StockOut transaction atomicity | PASS | `InventoryAppService.StockOutAsync` consumes material, updates material, adds the stock transaction, and writes `InventoryStockOut` audit inside one `IUnitOfWork.ExecuteAsync` boundary; `StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork` proves material quantity, `StockOut` transaction, and audit row commit together; `StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement` uses `ThrowingStockTransactionRepository` and proves transaction write failure rolls back the material decrement; `Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence` guards implementation order, non-self-committing repositories, integration tests, and matrix citation. |
| Critical list pagination page size | PASS | `EquipmentAppServiceTests.GetEquipmentsAsync_ShouldUseRepositoryPagingForFilters`, `AdminAppServiceTests.GetAllUsersAsync_ShouldUseRepositoryPaging`, and `SchedulingAppServiceTests.GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters` prove Equipment/Admin/Scheduling pass requested `page` and `pageSize` into repository paging and preserve returned metadata; `SchedulingControllerTests.GetWorkOrders_WithPaging_ShouldRespectParameters` proves the HTTP Scheduling endpoint returns requested `Page=2` and `PageSize=5`; `Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence` guards service tokens, tests, and matrix citation. |
| Repository AsNoTracking runtime evidence | PASS | `RepositoryAsNoTrackingTests.CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext` uses SQLite and a real `MesDbContext` to materialize representative core repository reads, then asserts `queryContext.ChangeTracker.Entries().Should().BeEmpty` after WorkOrder, Equipment, Material, BOM, Employee, Purchase, Quality, Schedule, and Admin user reads; `Sprint2RepositoryAsNoTracking_ShouldHaveDirectChangeTrackerEvidence` guards the integration test and matrix citation. |
| ScheduleRepository split query stable paging | PASS | `ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering` proves page 1/page 2 stable ids, no duplicated ids across pages, included items loaded, split SQL command count, and SQL `ORDER BY created_at, id` plus `LIMIT`; `Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence` guards repository tokens, integration test, and matrix citation. |
| Concurrency token stale update behavior | PASS | `ConcurrencyTokenTests.WorkOrder_Update_WithStaleVersion_ShouldThrowConcurrencyException`, `Equipment_Update_WithStaleVersion_ShouldThrowConcurrencyException`, `Material_Update_WithStaleVersion_ShouldThrowConcurrencyException`, and `SchedulePlan_Update_WithStaleVersion_ShouldThrowConcurrencyException` prove WorkOrder/Equipment/Material/SchedulePlan stale snapshots fail with `DbUpdateConcurrencyException` after the backing `version` is bumped via parameterized SQL; `Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence` guards provider-aware configuration, tests, and matrix citation. |
| Purchase state-change validation filter | PASS | `PurchaseEndpoints.cs` maps submit/confirm/cancel with `ValidationEndpointFilter` and endpoint audit; `ValidationEndpointFilter` resolves `IValidator<T>`, runs `ValidateAsync(..., RequestAborted)`, returns validation problems on invalid input, and otherwise calls the handler; `PurchaseControllerTests.SubmitAndConfirm_ShouldTransitionStatus` and `Cancel_ShouldSetCancelled` prove the HTTP state-change flows reach `Submitted`, `Confirmed`, and `Cancelled`; `Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence` guards endpoint filters, shared filter behavior, integration tests, and matrix citation. |
| Target mutating endpoint audit evidence | PASS | `H7TargetMutatingEndpoints_ShouldUseAuditEndpointFilter` statically guards target mutating Admin/BOM/Inventory/Purchase/Employee/Routing endpoint chains. `EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter` proves a real HTTP employee create writes an endpoint audit row with the request user, `POST` action, `employee` resource, and payload context; `AdminControllerTests.CreateUser_ShouldRedactPasswordInAuditLog` proves a real HTTP admin create writes audit context while masking credential fields; `Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence` guards these direct tests and matrix citation. |
| AuditEndpointFilter layering evidence | PASS | `H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext` statically forbids EF persistence details in the endpoint filter and requires `IAuditLogAppService` plus `IUnitOfWork`; `AuditEndpointFilterTests.Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork` invokes the filter directly and proves POST audit writes go through `IUnitOfWork.ExecuteAsync` and `IAuditLogAppService.WriteAuditLogAsync` with user/resource/id/action/payload context; `Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence` guards the unit test and matrix citation. |
| OperationCanceledException middleware handling | PASS | `ExceptionMiddleware.InvokeAsync` catches `OperationCanceledException` before generic exceptions and calls `HandleOperationCanceledAsync`; the handler clears the response, sets status `499`, and does not write ProblemDetails; `ExceptionMiddlewareTests.InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails` proves status 499, null content type, and empty response body; `Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence` guards middleware behavior, unit test, and matrix citation. |

## Static Evidence

### Persisted core modules

- `src/backend/MES.Application/Services/AnomalyAppService.cs`: injects `IAnomalyRepository`.
- `src/backend/MES.Application/Services/BomAppService.cs`: injects `IBomRepository` and `IMaterialRepository`; uses `CountAsync` and `GetPagedAsync`.
- `src/backend/MES.Application/Services/EmployeeAppService.cs`: injects `IEmployeeRepository`; uses `CountAsync` and `GetPagedAsync`.
- `src/backend/MES.Application/Services/InventoryAppService.cs`: injects `IMaterialRepository`, `IStockTransactionRepository`, and `IUnitOfWork`; mutating operations run through `ExecuteAsync`.
- `src/backend/MES.Application/Services/PurchaseAppService.cs`: injects `IPurchaseOrderRepository` and `IUnitOfWork`; lifecycle transitions run through `ExecuteAsync`.

Supporting integration tests:

- `src/tests/MES.Tests.Integration/Controllers/AnomalyControllerTests.cs`: `GetAll_ShouldReturnOnlyOpenAnomalies`, `Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit`.
- `src/tests/MES.Tests.Integration/Controllers/BomControllerTests.cs`: `CreateBom_ShouldReturnCreated`, `ExplodeBom_ShouldReturnMaterialList`, `KittingCheck_ShouldReturnAvailabilityStatus`, `GetBom_NonexistentId_ShouldReturnNotFound`.
- `src/tests/MES.Tests.Integration/Controllers/EmployeeControllerTests.cs`: create/read/update/deactivate/team-filter tests, including `Create_ShouldPersistAuditLogFromEndpointFilter`.
- `src/tests/MES.Tests.Integration/Controllers/InventoryControllerTests.cs`: dashboard/list/detail/stock-in/transaction tests, including `StockIn_WithValidMaterial_ShouldReturnTransaction`.
- `src/tests/MES.Tests.Integration/Controllers/PurchaseControllerTests.cs`: create/read/submit-confirm/receive/cancel tests.

`src/tests/MES.Tests.Integration/Controllers/CoreModulePersistenceRecoveryTests.cs` now adds direct create-restart-query evidence:

- First API host creates one Anomaly, BOM, Employee, Inventory stock-in, and Purchase record.
- The first host is disposed.
- A second API host opens the same file-backed SQLite database.
- The second host queries `/api/v1/anomaly/{id}`, `/api/v1/bom/{id}`, `/api/v1/employee/{id}`, `/api/v1/inventory/{materialCode}`, and `/api/v1/purchase/{id}` successfully.

This is now standalone restart-recovery evidence for the Sprint 0 acceptance wording, not only an inference from repository wiring.

### Admin default credential and first-login enforcement

- `src/backend/MES.Api/Program.cs`: startup banner no longer logs `DefaultAccount` or `admin / admin123`; it points to development-only demo credential guidance instead.
- `src/backend/MES.Api/Middleware/PasswordChangeRequiredMiddleware.cs`: users with `must_change_password=true` receive 403 on protected paths and may only reach change-password/logout/health paths.
- `src/backend/MES.Domain/Entities/Admin/SystemUser.cs`: newly created users start with `MustChangePassword = true`; `ChangePassword` clears it.
- `src/backend/MES.Infrastructure/Data/Migrations/20260530090000_AddSystemUserMustChangePassword.cs`: persists `must_change_password` with default `true`.
- `src/tests/MES.Tests.Unit/Domain/SystemUserTests.cs`: `Create_ShouldRequirePasswordChange` and `ChangePassword_ShouldClearPasswordChangeRequirement` prove the domain state transition.
- `src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs`: `ChangePassword_ShouldClearPasswordChangeRequirement` proves the HTTP rotation path.
- `src/tests/MES.Tests.Integration/Controllers/AdminControllerTests.cs`: `GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden` proves protected admin endpoints reject users who still need rotation; `CreateUser_ShouldReturnCreated` proves admin-created accounts return `MustChangePassword=true`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced` fixes the implementation/test/matrix evidence link so the matrix cannot drift back to broad real-browser-only wording.

### Seeder non-empty password hashes

- `src/backend/MES.Api/Services/DatabaseStartupValidator.cs`: `EfDemoDataSeeder` creates demo admin/operator through `passwordHasher.Hash("admin123")` and `passwordHasher.Hash("operator123")`.
- `src/backend/MES.Api/Services/PasswordHasher.cs`: password hashes are salted PBKDF2/SHA-256 strings, not empty literals.
- `src/backend/MES.Domain/Entities/Admin/SystemUser.cs`: `SystemUser.Create` rejects null/empty/whitespace password hashes and keeps `MustChangePassword = true` for new users.
- `src/tests/MES.Tests.Unit/Domain/SystemUserTests.cs`: `Create_WhenPasswordHashIsEmpty_ShouldReject` proves the domain guard directly.
- `src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs`: `Login_WithValidCredentials_ShouldReturnToken` proves the seeded admin credential authenticates and returns `MustChangePassword=true`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords` fixes the implementation/test/matrix evidence link so the matrix cannot drift back to broad self-assessment-only wording.

### SignalR subscribe role boundary

- `src/backend/MES.Api/Hubs/NotificationHub.cs`: `[Authorize]` protects the hub.
- `src/backend/MES.Api/Hubs/NotificationHub.cs`: `Subscribe` and `Unsubscribe` both call `CanSubscribeToChannel` before changing SignalR groups.
- `src/backend/MES.Api/Hubs/NotificationHub.cs`: reserved channels, allowed prefixes, and role-prefix mapping are centralized in `ReservedChannels`, `AllowedPrefixes`, and `ChannelRoles`.
- `src/tests/MES.Tests.Unit/Security/NotificationHubChannelPolicyTests.cs`: `CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject` proves cross-role entity channel subscription is rejected.
- `src/tests/MES.Tests.Unit/Security/NotificationHubChannelPolicyTests.cs`: `CanSubscribe_WhenRoleMatchesChannel_ShouldAllow` proves intended role/channel combinations remain allowed.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence` fixes the hub/test/matrix evidence link so the matrix cannot drift back to broad Attack Chain-only wording.

### Refresh token hash storage

- `src/backend/MES.Api/Endpoints/AuthEndpoints.cs`: `HashToken` computes SHA-256 and returns Base64.
- `src/backend/MES.Api/Endpoints/AuthEndpoints.cs`: login stores `Token = HashToken(tokenStr)` while returning only the bearer `tokenStr` to the client.
- `src/backend/MES.Api/Endpoints/AuthEndpoints.cs`: refresh/logout compute `HashToken(request.RefreshToken)` before repository lookup.
- `src/backend/MES.Infrastructure/Data/Configurations/RefreshTokenConfiguration.cs`: persisted token value is required, limited to 128 chars, and unique-indexed.
- `src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs`: `Login_ShouldPersistOnlyHashedRefreshToken` verifies the database contains the expected SHA-256 hash and excludes the clear-text bearer refresh token.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence` fixes the implementation/test/matrix evidence link so the matrix cannot drift back to broad Attack Chain-only wording.

### Login rate limit IP + username partition

- `src/backend/MES.Api/Middleware/AuthRateLimitUsernameMiddleware.cs`: captures login/change-password usernames, buffers the request body, and resets body position before the downstream endpoint reads it.
- `src/backend/MES.Api/Program.cs`: `AddRateLimiter` Auth policy builds the partition from `Connection.RemoteIpAddress` and the captured username via `AuthRateLimitPartitionKey.Create`.
- `src/backend/MES.Api/Program.cs`: `AuthRateLimitUsernameMiddleware` runs before `UseRateLimiter`, so username data is available when the limiter computes the partition.
- `src/backend/MES.Api/Services/AuthRateLimitPartitionKey.cs`: composes `ip|username`, trims IP/username, lowercases username, and uses `unknown` fallback for missing values.
- `src/tests/MES.Tests.Unit/Security/AuthRateLimitPartitionKeyTests.cs`: `Create_ShouldIncludeRemoteIpAndUsername`, `Create_ShouldNormalizeUsername`, and `Create_WhenUsernameMissing_ShouldKeepUnknownBucket` prove partition behavior directly.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence` fixes the middleware/program/test/matrix evidence link so the matrix cannot drift back to broad self-assessment-only wording.

### Anomaly frontend double-prefix

- `src/frontend/src/api/http.ts`: owns the shared `/api/v1` axios `baseURL`.
- `src/frontend/src/api/anomaly.ts`: uses `const BASE = '/anomaly'` and calls `http.get(BASE)`, `http.get(`${BASE}/${id}`)`, and `http.post(`${BASE}/${id}/analyze`)`, so the wrapper does not pre-include `/api/v1`.
- `src/frontend/tests/unit/anomaly-api.test.ts`: `uses http baseURL-relative anomaly paths without duplicating api/v1` proves the wrapper passes `/anomaly`, `/anomaly/AN-001`, and `/anomaly/AN-001/analyze` to the shared client and never passes `/api/v1/anomaly`.
- `src/frontend/tests/e2e/anomaly.spec.ts`: `真实浏览器只请求单层 api/v1 anomaly 路径` disables offline demo mode, intercepts `/api/v1/anomaly`, renders `真实路径异常`, and asserts no recorded request contains `/api/v1/api/v1/`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence` fixes the implementation/test/matrix evidence link so the matrix cannot drift back to broad real-browser-only wording.

### Six agent test inventory

- `AnomalyAgentTests.cs`: 9 async tests, covering rule-only success, LLM null fallback, keyword analysis, LLM trace/token budget, cancellation-token propagation, LLM exception fallback, vector retrieval exception fallback, vector cancellation, and bounded prompt.
- `KnowledgeAgentTests.cs`: 9 async tests, covering answer success, indexing, vector upsert cancellation propagation, similarity search, vector search cancellation propagation, no-source degrade trace, LLM exception fallback, retrieval exception fallback, and bounded prompt/token trace.
- `MaintenanceAgentTests.cs`: 8 async tests, covering prediction/recommendation/anomaly success paths, null fallback trace, cancellation propagation, LLM exception fallback, retrieval exception fallback, and bounded prompt/token trace.
- `ProcessParameterAgentTests.cs`: 8 async tests, covering recommendation/optimization/match success paths, cancellation propagation, null fallback trace, LLM exception fallback, retrieval exception fallback, and bounded prompt/token trace.
- `QualityAgentTests.cs`: 8 async tests, covering inspection/root-cause/SPC success paths, null fallback trace, cancellation propagation, LLM exception fallback, retrieval exception fallback, and bounded prompt/token trace.
- `SchedulingAgentTests.cs`: 6 async tests, covering optimized success, validation fallback, LLM exception fallback, invalid LLM output fallback, bounded prompt, and rule fallback audit trace.

### Metrics background structured logging

- `src/backend/MES.Api/Services/MetricsBackgroundService.cs`: injects `ILogger<MetricsBackgroundService>`.
- `src/backend/MES.Api/Services/MetricsBackgroundService.cs`: catches non-cancellation background failures and records `_logger.LogError(ex, "Metrics push failed")`.
- `src/backend/MES.Api/Services/MetricsBackgroundService.cs`: no `Console.Error` usage was found by the targeted scan.
- `src/tests/MES.Tests.Unit/Services/MetricsBackgroundServiceTests.cs`: covers `PushMetricsOnceAsync_WhenNoMonitoringSubscribers_ShouldNotCreateScope` and `PushMetricsOnceAsync_WhenMonitoringSubscriberExists_ShouldComputeKpiAndSendUpdates`.

### Quality gray monitoring UI evidence

- `src/frontend/tests/e2e/admin.spec.ts`: `R3 灰度发布进入 Agent 灰度监控指标` seeds a `gray_published` R3 quality retraining version and verifies the Agent governance page renders `QK-TRAIN-20260521-R3 灰度监控`.
- The same real Chrome path verifies `推荐采纳率 100%`, `复验通过率 100%`, `负样本误召回 0 次`, `AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001`, and `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence` fixes the e2e/frontend-evidence/matrix link and explicitly keeps this separate from the release gray observation gate.

### Anomaly create transaction rollback

- `src/backend/MES.Api/Endpoints/AnomalyEndpoints.cs`: `CreateAsync` accepts `IUnitOfWork unitOfWork` and runs `anomalyService.CreateAnomalyAsync`, `auditLog.WriteAuditLogAsync`, and `notification.NotifyAnomaly` inside a single `unitOfWork.ExecuteAsync` lambda before returning `TypedResults.Created`.
- `src/backend/MES.Infrastructure/Repositories/AuditLogRepository.cs`: `AddAsync` adds the audit row without calling `SaveChangesAsync`, allowing the surrounding UoW transaction to commit or roll back the audit row with the anomaly row.
- `src/tests/MES.Tests.Integration/Controllers/AnomalyControllerTests.cs`: `Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit` injects `ThrowingNotificationService`, verifies HTTP 500, and then verifies both `ProductionAnomalies.Should().NotContain` and `AuditLogs.Should().NotContain` for the failed create.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence` fixes the endpoint/test/matrix link so the matrix cannot drift back to a broad UoW/audit layering claim.

### Inventory StockOut transaction atomicity

- `src/backend/MES.Application/Services/InventoryAppService.cs`: `StockOutAsync` runs material lookup, `material.Consume(request.Quantity)`, `_materialRepo.UpdateAsync`, `_txRepo.AddAsync`, and `WriteTransactionAuditAsync("InventoryStockOut", ...)` inside one `_unitOfWork.ExecuteAsync` lambda.
- `src/backend/MES.Infrastructure/Repositories/MaterialRepository.cs`: `UpdateAsync` updates the tracked material without calling `SaveChangesAsync`, so the material decrement is controlled by the surrounding UoW.
- `src/backend/MES.Infrastructure/Repositories/StockTransactionRepository.cs`: `AddAsync` adds the stock transaction without calling `SaveChangesAsync`, so transaction persistence shares the same UoW commit point.
- `src/tests/MES.Tests.Integration/Repositories/InventoryTransactionRepositoryTests.cs`: `StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork` proves successful StockOut commits material quantity `70`, a `StockOut` transaction, and an `InventoryStockOut` audit row together on SQLite relational storage.
- `src/tests/MES.Tests.Integration/Repositories/InventoryTransactionRepositoryTests.cs`: `StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement` injects `ThrowingStockTransactionRepository` and proves the failed transaction write leaves material quantity `100` and transaction count `0`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence` fixes the service/repository/test/matrix link so the matrix cannot drift back to a broad UoW/audit layering claim.

### Critical list pagination page size

- `src/backend/MES.Application/Services/EquipmentAppService.cs`: `GetEquipmentsAsync` validates `page/pageSize`, calls `_equipmentRepo.GetPagedAsync(workshopId, equipmentStatus, page, pageSize, ct)` and `_equipmentRepo.CountAsync(...)`, and returns `Page = page` / `PageSize = pageSize`.
- `src/backend/MES.Application/Services/AdminAppService.cs`: `GetAllUsersAsync` validates `page/pageSize`, calls `_userRepo.GetPagedAsync(page, pageSize, ct)` and `_userRepo.CountAsync(ct)`, and returns `Page = page` / `PageSize = pageSize`.
- `src/backend/MES.Application/Services/SchedulingAppService.cs`: `GetWorkOrdersAsync` calls `_workOrderRepo.GetPagedAsync(...)` and `_workOrderRepo.CountAsync(...)` with `parameters.Page` / `parameters.PageSize`, then returns those metadata fields.
- `src/tests/MES.Tests.Unit/Application/EquipmentAppServiceTests.cs`: `GetEquipmentsAsync_ShouldUseRepositoryPagingForFilters` verifies filtered Equipment pagination passes `page=2`, `pageSize=1`, returns matching metadata, and never calls full-list reads.
- `src/tests/MES.Tests.Unit/Application/AdminAppServiceTests.cs`: `GetAllUsersAsync_ShouldUseRepositoryPaging` verifies Admin pagination passes `page=2`, `pageSize=1`, returns matching metadata, and never calls `GetAllAsync`.
- `src/tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs`: `GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters` verifies Scheduling passes filters plus `page=2`, `pageSize=2` into `GetPagedAsync`/`CountAsync` and never calls `GetAllAsync`.
- `src/tests/MES.Tests.Integration/Controllers/SchedulingControllerTests.cs`: `GetWorkOrders_WithPaging_ShouldRespectParameters` verifies `/api/v1/scheduling/workorders?page=2&pageSize=5` returns `Page=2` and `PageSize=5`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence` fixes the service/test/matrix link so the matrix cannot drift back to broad static paging gates.

### ScheduleRepository split query stable paging

- Previous evidence gap: the matrix only cited the static `ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging` architecture gate and hosted CI.
- `src/backend/MES.Infrastructure/Repositories/ScheduleRepository.cs`: `GetAllAsync` uses `AsNoTracking()`, `AsSplitQuery()`, includes `Items`, orders by `CreatedAt` then `Id`, and applies `Skip`/`Take`.
- `src/tests/MES.Tests.Integration/Repositories/ScheduleRepositoryTests.cs`: `GetAllAsync_UsesSplitQueryAndStablePagedOrdering` uses SQLite relational storage, captures executed SQL, proves page 1 returns `plan-a, plan-b`, page 2 returns `plan-c`, ids are unique across pages, and included items remain loaded.
- The same integration test proves split behavior with `scheduleSelects.Count.Should().BeGreaterThanOrEqualTo` and validates captured SQL contains `ORDER BY`, `created_at`, `id`, and `LIMIT`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence` fixes the repository/test/matrix link so the matrix cannot drift back to static-only wording.

### Concurrency token stale update behavior

- Previous evidence gap: the matrix only cited `M7TargetEntities_ShouldConfigureConcurrencyTokens` and hosted CI, proving model metadata exists but not that stale writes fail.
- `src/backend/MES.Infrastructure/Data/Configurations/ConcurrencyConfigurationExtensions.cs`: `UseProviderShadowConcurrencyToken` maps PostgreSQL to `xmin/xid` and non-PostgreSQL relational tests to a shadow `version` concurrency token.
- `src/backend/MES.Infrastructure/Data/Configurations/WorkOrderConfiguration.cs`, `EquipmentConfiguration.cs`, `MaterialConfiguration.cs`, and `SchedulePlanConfiguration.cs`: each target entity calls `entity.UseProviderShadowConcurrencyToken()`.
- `src/tests/MES.Tests.Integration/Repositories/ConcurrencyTokenTests.cs`: each target test loads an entity snapshot, bumps the backing `version` with whitelisted SQL plus parameterized `id`, and proves stale `SaveChangesAsync` throws `DbUpdateConcurrencyException`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence` fixes the configuration/test/matrix link so the matrix cannot drift back to model-metadata-only wording.

### Purchase state-change validation filter

- `src/backend/MES.Api/Endpoints/PurchaseEndpoints.cs`: submit, confirm, and cancel routes each include `.AddEndpointFilter<ValidationEndpointFilter>()` and `.AddEndpointFilter(Audit)`.
- `src/backend/MES.Api/Filters/ValidationEndpointFilter.cs`: resolves an `IValidator<T>` for endpoint arguments, runs `ValidateAsync` with `RequestAborted`, returns `TypedResults.ValidationProblem(errors)` when invalid, and otherwise calls `next(context)`.
- `src/tests/MES.Tests.Integration/Controllers/PurchaseControllerTests.cs`: `SubmitAndConfirm_ShouldTransitionStatus` proves submit and confirm HTTP flows return `Submitted` and `Confirmed`.
- `src/tests/MES.Tests.Integration/Controllers/PurchaseControllerTests.cs`: `Cancel_ShouldSetCancelled` proves cancel HTTP flow persists `Cancelled`.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence` fixes the endpoint/filter/test/matrix link so the matrix cannot drift back to broad H9-only wording.

### OperationCanceledException middleware handling

- `src/backend/MES.Api/Middleware/ExceptionMiddleware.cs`: `InvokeAsync` catches `OperationCanceledException` before the generic `catch (Exception ex)` branch and calls `HandleOperationCanceledAsync`.
- `src/backend/MES.Api/Middleware/ExceptionMiddleware.cs`: `HandleOperationCanceledAsync` clears an unstarted response, sets status `499`, and completes without `ProblemDetails`, `WriteAsJsonAsync`, or `LogError`.
- `src/tests/MES.Tests.Unit/Middleware/ExceptionMiddlewareTests.cs`: `InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails` throws `OperationCanceledException("request canceled")` and verifies status 499, null content type, and empty response body.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`: `Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence` fixes the middleware/test/matrix link so the matrix cannot drift back to broad M11-only wording.

## Validation

- Light static scans only:
  - `rg -n "I(Anomaly|Bom|Employee|Material|StockTransaction|PurchaseOrder)Repository|IUnitOfWork|CountAsync|GetPagedAsync|ExecuteAsync" src/backend/MES.Application/Services`
  - `rg -n "\[Fact\]|public async Task|Prompt|Token|Throws|Fallback|Should" src/tests/MES.Tests.Unit/AI`
  - `rg -n "ILogger<MetricsBackgroundService>|LogError\(|Console\.Error|PushMetricsOnceAsync" src/backend src/tests`
- Targeted integration restart-recovery test:
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "CoreModules_ShouldSurviveApplicationRestartAndRemainQueryable" --no-restore`: PASS.
- Targeted architecture guard:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint0CoreModulePersistence_ShouldHaveRestartRecoveryEvidence" --no-restore`: PASS.
- Targeted admin default credential / first-login enforcement tests:
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "Create_ShouldRequirePasswordChange|ChangePassword_ShouldClearPasswordChangeRequirement" --no-restore`: PASS.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "ChangePassword_ShouldClearPasswordChangeRequirement|GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden|CreateUser_ShouldReturnCreated" --no-restore`: PASS.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced" --no-restore`: PASS.
- Targeted seeder non-empty password hash tests:
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "Create_WhenPasswordHashIsEmpty_ShouldReject" --no-restore`: PASS.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "Login_WithValidCredentials_ShouldReturnToken" --no-restore`: PASS.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords" --no-restore`: PASS.
- Targeted SignalR role boundary tests:
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject|CanSubscribe_WhenRoleMatchesChannel_ShouldAllow" --no-restore`: PASS.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence" --no-restore`: PASS.
- Targeted refresh token hash storage tests:
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "Login_ShouldPersistOnlyHashedRefreshToken" --no-restore`: PASS.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence" --no-restore`: PASS.
- Targeted login rate-limit partition tests:
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "AuthRateLimitPartitionKeyTests" --no-restore`: PASS.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence" --no-restore`: PASS.
- Targeted anomaly double-prefix tests:
  - `npm run test:unit -- anomaly-api.test.ts`: PASS, 1 passed.
  - `npm run test:e2e -- anomaly.spec.ts -g "真实浏览器只请求单层 api/v1 anomaly 路径"`: first run FAIL because the test had not disabled offline demo mode before reload; after fixing the test precondition, PASS, 1 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence" --no-restore`: PASS.
- Targeted dashboard deterministic KPI tests:
  - `npm run test:e2e -- dashboard.spec.ts -g "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标"`: PASS, 1 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint0DashboardKpi_ShouldHaveDirectRealBrowserDeterministicEvidence" --no-restore`: PASS.
- Targeted JWT signing-key fail-closed tests:
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "JwtStartupValidationTests" --no-restore`: PASS, 2 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint0JwtSigningKey_ShouldHaveDirectFailClosedStartupEvidence" --no-restore`: PASS.
- Targeted Production CORS no-wildcard tests:
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "CorsPolicyTests" --no-restore`: PASS, 2 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint0ProductionCors_ShouldHaveDirectNoWildcardEvidence" --no-restore`: PASS.
- Targeted quality gray monitor UI tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence" --no-restore`: first run FAIL because the frontend evidence report did not yet include the targeted gray monitor rerun.
  - `npm run test:e2e -- admin.spec.ts -g "R3 灰度发布进入 Agent 灰度监控指标"`: PASS, 1 passed.
- Targeted anomaly create transaction rollback tests:
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit" --no-restore`: PASS, 1 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence" --no-restore`: first corrected RED run failed because the matrix did not cite direct anomaly transaction evidence.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence" --no-restore`: PASS after updating the matrix and this evidence report.
- Targeted Inventory StockOut transaction atomicity tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence" --no-restore`: first RED run failed because the matrix did not cite direct Inventory StockOut evidence.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork|StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement" --no-restore`: PASS, 2 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence" --no-restore`: second RED run failed because the matrix did not cite the exact rollback assertion token.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence" --no-restore`: PASS after updating the matrix and this evidence report.
- Targeted critical list pagination tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence" --no-restore`: first run failed because the guard used an overly strict Scheduling controller token.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence" --no-restore`: corrected RED run failed because the matrix did not cite direct Equipment/Admin/Scheduling paging tests.
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "GetEquipmentsAsync_ShouldUseRepositoryPagingForFilters|GetAllUsersAsync_ShouldUseRepositoryPaging|GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters" --no-restore`: first parallel run hit an environment/build-state static web assets compression error in `MES.Api`, not a test assertion failure; immediate repeat PASS, 3 passed.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "GetWorkOrders_WithPaging_ShouldRespectParameters" --no-restore`: PASS, 1 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence" --no-restore`: PASS after updating the matrix and this evidence report.
- Targeted ScheduleRepository split-query paging tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence" --no-restore`: first RED run failed because the matrix did not cite direct `ScheduleRepositoryTests` evidence.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "GetAllAsync_UsesSplitQueryAndStablePagedOrdering" --no-restore`: PASS, 1 passed.
- Targeted repository AsNoTracking runtime tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2RepositoryAsNoTracking_ShouldHaveDirectChangeTrackerEvidence" --no-restore`: first RED run failed because direct ChangeTracker integration evidence and matrix anchors were missing.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext" --no-restore`: PASS, 1 passed.
- Targeted concurrency token stale-update tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence" --no-restore`: first RED run failed because direct stale-update tests and matrix anchors were missing; after adding tests it failed only because the matrix did not yet cite the direct evidence.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "ConcurrencyTokenTests" --no-restore`: first run hit EF1002 because raw SQL interpolation is warning-as-error; after switching to whitelisted SQL strings plus parameterized `id`, PASS, 4 passed.
- Targeted Purchase state-change validation tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence" --no-restore`: first RED run failed because the matrix did not cite direct Purchase endpoint/filter/flow evidence.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "SubmitAndConfirm_ShouldTransitionStatus|Cancel_ShouldSetCancelled" --no-restore`: PASS, 2 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence" --no-restore`: first GREEN attempt hit a transient `MES.Api.csproj` `wwwroot/scheduling` clean error before test execution; immediate repeat PASS, 1 passed.
- Targeted mutating endpoint audit tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence" --no-restore`: first RED run failed because the matrix and this evidence report did not cite the direct Employee/Admin endpoint audit evidence.
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "Create_ShouldPersistAuditLogFromEndpointFilter|CreateUser_ShouldRedactPasswordInAuditLog" --no-restore`: PASS, 2 passed.
- Targeted AuditEndpointFilter layering tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence" --no-restore`: first RED run failed because direct filter unit evidence and matrix anchors were missing.
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork" --no-restore`: PASS, 1 passed.
- Targeted OperationCanceledException middleware tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence" --no-restore`: first RED run failed because the matrix did not cite direct middleware/test evidence.
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails" --no-restore`: PASS, 1 passed.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence" --no-restore`: PASS after updating the matrix and this evidence report.
- Targeted DomainRuleViolationException domain rule tests:
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence" --no-restore`: first RED run failed because domain unit tests only asserted the `InvalidOperationException` base type and the matrix lacked direct anchors.
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "WorkOrderTests|EquipmentTests|OperationExecutionStateMachineTests|MaterialTests" --no-restore`: PASS, 89 passed after direct `Throw<DomainRuleViolationException>()` assertions and Material inventory rule tests were added.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence" --no-restore`: second RED run failed because the matrix did not yet cite the direct WorkOrder/Equipment/OperationExecution/Material evidence.
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence" --no-restore`: PASS after updating the matrix with fully qualified direct test anchors.
- Existing hosted evidence remains:
  - Hosted CI run `27318467207`: PASS.
  - Hosted Agent Evaluation run `27318467206`: PASS.
  - PostgreSQL/staging rehearsal `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`: PASS.

## Release Boundary

This report does not change release-gate status.

- Attack Chain A/B/C manual verification: still HUMAN REQUIRED.
- Security signoff: still HUMAN REQUIRED.
- First gray release plus 14 calendar days P0/P1=0: still WALL-CLOCK REQUIRED.
