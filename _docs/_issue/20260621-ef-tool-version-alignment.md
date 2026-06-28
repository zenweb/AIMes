# 2026-06-21 Issue - EF Tool Version Alignment

## Problem

Staging rehearsal passed but emitted a warning because local `dotnet-ef` was `9.0.0` while EF runtime packages are `10.0.9`.

## Impact

The warning did not block migrations, but it weakens repeatability and creates avoidable noise in staging/release evidence.

## Resolution

- Updated `dotnet-tools.json` to `dotnet-ef` `10.0.9`.
- Added a guard that compares `dotnet-tools.json` with `Directory.Packages.props`.
- Verified EF migration command runs without the version skew warning.

## Status

Closed.
