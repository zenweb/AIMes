# 2026-07-05 Device Data Field Verification Boundary

## Result

`BLOCKED_ENVIRONMENT_MISMATCH`

The requested field deployment verification targets could not be closed inside the current `AIMes/v1` runtime because the active repository, container logs, and PostgreSQL schema do not expose the requested device-data task surface.

## Requested Verification Targets

- Verify whether `DeviceDataIocTask` still logs false failure after successful processing.
- Verify whether permanently failing queue-head data is quarantined with `usemark=9`.

## Current Runtime

- Repository: `C:\AIWorks\AIMes\v1`
- API container: `aimes-api`
- API port mapping: `0.0.0.0:5002->5003/tcp`
- PostgreSQL container: `aimes-pg`
- API database connection: `Host=postgresql;Database=mes;Username=postgres;Password=postgres`

## Evidence Collected

### Container status

```text
aimes-api        v1-api                         0.0.0.0:5002->5003/tcp   Up 7 hours
aimes-redis      redis:7-alpine                 6379/tcp                  healthy
aimes-pg         postgres:16-alpine             5432/tcp                  healthy
aimes-rabbitmq   rabbitmq:4-management-alpine   5672/tcp, 15672/tcp       healthy
aimes-qdrant     qdrant/qdrant:latest           6333-6334/tcp             healthy
```

### Code symbol scan

Command:

```powershell
rg -n "DeviceData|IocTask|ShouldQuarantine|Quarantine|SubmitLock|usemark|use_mark|useMark" -S src
```

Result:

```text
No matches in C:\AIWorks\AIMes\v1\src.
```

### Recent API log scan

Command:

```powershell
docker logs --since 2h --tail 2000 aimes-api 2>&1 |
  Select-String -Pattern "DeviceDataIocTask|成功后误报失败|usemark|useMark|quarantine|隔离" -CaseSensitive:$false
```

Result:

```text
No matching DeviceDataIocTask or usemark/quarantine evidence in the sampled API logs.
```

Observed noise:

```text
OpenTelemetry/export related connection errors to localhost:4317 were present, but these are not evidence for DeviceDataIocTask or queue quarantine behavior.
```

### PostgreSQL schema scan

Command:

```powershell
docker exec aimes-pg psql -U postgres -d mes -c "\dt"
```

Result:

```text
40 public tables were present, including scheduling, quality, equipment, audit, and agent decision tables.
No device/ioc queue table was present.
```

Command:

```powershell
docker exec aimes-pg psql -U postgres -d mes -c "select table_schema, table_name, column_name from information_schema.columns where lower(column_name) like '%use%' or lower(column_name) like '%mark%' or lower(column_name) like '%quarantine%' or lower(table_name) like '%device%' or lower(table_name) like '%ioc%' order by table_schema, table_name, ordinal_position limit 200;"
```

Result:

```text
No public usemark, quarantine, device, or ioc queue columns/tables were found.
```

## Interpretation

The current `AIMes/v1` deployment is healthy enough to serve the MES API on port `5002`, but it is not the runtime that contains the `DeviceDataIocTask` / `usemark=9` queue processing surface described in the handoff.

Continuing to probe this runtime for those two targets would be token and time waste because the target code paths are not present here.

## Required Next Input

To continue the requested field deployment verification, provide one of:

- The correct repository or branch containing `DeviceDataIocTask`, `ShouldQuarantine`, `SubmitLockHandle`, and `usemark`.
- The correct container/service name and database/table names for the device-data queue.
- A log bundle or deployment host where the device-data task is actually running.

## Non-Blocking Quality Debt

The following items remain correctly classified as non-blocking quality debt until behavior-level tests are added in the correct codebase:

- `ShouldQuarantine` failure-count/time-window threshold behavior.
- `SubmitLockHandle` concurrent reference-count cleanup behavior.
