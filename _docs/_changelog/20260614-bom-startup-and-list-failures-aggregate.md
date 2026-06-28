# 20260614 BOM startup and list failures aggregate

## Change
- Split `BomBoard` alert state into startup, list, and operation lanes.
- BOM startup engineering evidence failures now remain visible when the BOM list API also falls back to local demo data.
- Existing operation-specific alerts still clear only their own lane after a later success.

## Evidence
- `npm run test:unit -- tests/unit/bom-board.test.ts -t "keeps both startup engineering evidence and BOM list fallback failures visible"`: 1 passed.
- `npm run test:unit -- tests/unit/bom-board.test.ts`: 13 passed.
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 启动工程证据和列表加载同时失败" --project=chromium`: 1 passed.
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts --project=chromium`: 15 passed.
- `npm run test:unit:coverage`: 105 files / 778 tests passed; global line coverage 84.18%; `BomBoard.vue` line coverage 79.66%.

## Fail Loud
- Known coverage warning remains: `--localstorage-file was provided without a valid path`.
