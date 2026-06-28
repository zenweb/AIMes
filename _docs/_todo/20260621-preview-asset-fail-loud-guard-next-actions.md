# TODO - Preview Asset Fail-Loud Guard Next Actions

- Keep using `npm run build` before `npm run preview` for user-facing 4173 entries.
- Keep real browser smoke for critical routes after restarting preview.
- Consider adding this guard to CI or a dedicated preview-readiness script if preview packaging continues to be a recurring source of confusion.
- Do not use this guard as release proof; it only checks local preview asset integrity.
- Keep `tests/unit/preview-asset-check.test.ts` focused on asset integrity only; do not expand it into a preview-server integration test unless a separate startup harness is added.
- Keep recursive manifest scanning in place because Nuxt records CSS, fonts, preloads, and prefetches outside the top-level `modules` map.
