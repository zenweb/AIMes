# 2026-06-15 BOM kitting OTD sync browser evidence

- 新增真实浏览器 e2e：`BOM 齐套检查包 OTD 证据链同步失败后真实浏览器锁定发布动作`。
- Chromium 只对 `aimes_otd_evidence_chain` 注入 `localStorage.setItem` 失败，验证 BOM 主包写入成功后 UI 仍保持已发布锁定。
- 断言告警 fail loud：`BOM 齐套检查包已发布，但 OTD 证据链同步失败`，并显示注入错误 `chromium OTD evidence storage unavailable`。
- 断言主包 `aimes_bom_kitting_package` 仍包含 `bom-kitting-package-bom-a100-wo-rush-9001`，而 OTD 证据链未伪造写入。
- 新增证据报告：`_docs/_reports/bom-kitting-otd-sync-browser-evidence-20260615.md`。

验证：
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 齐套检查包 OTD 证据链同步失败"`：1/1 passed。
