# Issue: Attack Chain automated evidence used Debug output and hit file lock

## Symptom

`run-attack-chain-automated-evidence.ps1` failed while writing `MES.Domain.dll` under `obj/Debug/net10.0`.

## Root cause

Background `dotnet` processes held Debug build artifacts. The evidence script did not specify a configuration, so it used Debug and could collide with those locks.

## Resolution

The script now uses `--configuration Release` for all four evidence test invocations. The same test filters are retained.

## Status

Automated Attack Chain support evidence is PASS. Manual Attack Chain verification remains pending.

