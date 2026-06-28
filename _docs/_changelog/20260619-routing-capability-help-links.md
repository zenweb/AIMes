# 2026-06-19 Routing Capability Help Links

## Change
- 在工艺路线管理的 R-B200 OP-090 能力校验闭环中加入双语操作提示。
- 增加关联证据入口：AI 排产复核、审计回放、报表证据。
- 增加复杂操作帮助入口：`帮助：能力校验支持`，锚定到能力校验操作提示。

## Evidence
- RED: `npx vitest run tests/unit/routing-board.test.ts --coverage.enabled=false` failed because `.validation-guidance` was missing.
- GREEN: `npx vitest run tests/unit/routing-board.test.ts --coverage.enabled=false` passed, 13 tests.
- Regression refresh: `npm run test:unit:coverage` passed, 111 files / 1082 tests.
- Coverage totals: statements 89.71%, branches 77.15%, functions 89.92%, lines 92.83%.
- Static check: `npm run lint` passed.
- Browser: production build + `scripts/preview.mjs` on port 4173 verified the bilingual guide, three related evidence links, and help anchor in Chromium.
- Browser report: `_docs/_reports/routing-capability-help-links-browser-20260619.json`.
- Browser screenshot: `_docs/_reports/routing-capability-help-links-browser-20260619.png`.

## Note
- Nuxt dev startup still showed an independent DX issue earlier, but the slice now has release-like preview browser evidence. See `_docs/_issue/20260619-routing-capability-help-links.md`.
