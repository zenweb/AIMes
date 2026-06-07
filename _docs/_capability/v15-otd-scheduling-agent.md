# V1.5 Capability: OTD Scheduling Agent

## Scope

- Backend Agent decision aggregate: `AgentTriggerEvent`, `AgentDecision`, `AgentDecisionScenario`, `AgentEvidenceLink`, `AgentActionResult`.
- Scheduling Agent APIs: recommend, list, get, adopt, reject.
- Permission policy: Agent write actions require Admin in the current implementation and write policy rejection audit rows when denied.
- Evidence chain: recommend writes `AiDecisionTraceEntity`; adopt writes `ScheduleAdoptionFeedback` and audit rows.

## Verification

- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`: 18 passed.
- `dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false`: passed.

## Remaining Product Work

- Expand role matrix beyond Admin-only execution.
- Connect commercial `SchedulingAgent` LLM refinement path where available.
