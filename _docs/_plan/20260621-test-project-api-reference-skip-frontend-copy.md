# Plan: Test Project API Reference Skip Frontend Copy

## Goal
Make backend test entrypoints stable by preventing test project builds from deleting or copying frontend static assets through the API project reference.

## Steps
1. Inspect `MES.Api.csproj` frontend copy targets and existing architecture tests.
2. Add a RED architecture rule for test project references to `MES.Api.csproj`.
3. Add `SkipFrontendBuildCopy=true` metadata to the affected test project references.
4. Verify architecture, integration, and unit filtered tests without explicit `/p:SkipFrontendBuildCopy=true`.

## Status
- Completed on 2026-06-21.

