# Issue: BOM kitting package could appear retryable after OTD sync failure

## Symptom

When `writeBomKittingPackage` succeeded but `upsertOtdEvidenceChainRecord` failed, `BomBoard` caught the whole block as a package publication failure. The UI stayed in the unpublished state, so operators could retry and duplicate the already-written BOM kitting package.

## Root cause

Primary package persistence and secondary OTD evidence-chain sync were handled in one `try/catch`, so a downstream evidence failure rolled back the UI state of the successful primary action.

## Fix

Set `bomKittingPackage` immediately after `writeBomKittingPackage` succeeds, then run OTD evidence-chain sync in its own nested `try/catch`. If OTD sync fails, keep the package locked and show a fail-loud alert.

## Status

Resolved and covered by targeted unit test plus full frontend coverage.
