# Issue: staging Docker preflight false negative

## Symptom

`run-staging-rehearsal.ps1` failed during Docker engine preflight even while direct `docker info` returned a healthy Docker Desktop Linux engine.

## Root cause

The script relied on PowerShell process helpers in ways that were not reliable across the current Windows PowerShell execution path:

- `Wait-Process` success output was previously easy to misclassify.
- `Start-Process -PassThru` returned a process object whose `ExitCode` was blank in the script context even when `docker info` printed a healthy server block.

## Fix

Replaced the preflight implementation with `System.Diagnostics.ProcessStartInfo`, redirected stdout/stderr, bounded execution using `WaitForExit($DockerEngineTimeoutSeconds * 1000)`, and checked the real process `ExitCode`.

## Status

Resolved for the staging script. Verified by architecture test, parser check, staging rehearsal PASS, and release gate audit PASS with gray observation deferred.
