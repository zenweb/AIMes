# Schedule workbench guidance browser evidence

Date: 2026-06-19

## Environment

- Frontend build: `npm run build`
- Preview server: `npm run preview -- --host 127.0.0.1`
- URL verified: `http://127.0.0.1:4173/scheduling/scheduling`
- Browser: headless Chromium through MCP browser automation
- Auth state: local demo admin credentials written to localStorage for route-guard access

## DOM evidence

```json
{
  "url": "http://127.0.0.1:4173/scheduling/scheduling",
  "title": "AIMes AI MES",
  "hasGuidance": true,
  "guidanceText": "优化或采纳前，请确认目标、锁定期、证据链和回写路径。Before optimizing or adopting a plan, confirm objective, lock window, evidence trail, and writeback path.审计回放 / Audit trail交付报表 / Delivery report帮助 / Help",
  "links": [
    {
      "text": "审计回放 / Audit trail",
      "href": "/audit-logs"
    },
    {
      "text": "交付报表 / Delivery report",
      "href": "/report"
    },
    {
      "text": "帮助 / Help",
      "href": "#schedule-workbench-help"
    }
  ],
  "hasHelp": true,
  "helpText": "先复核影响范围，再执行优化、采纳或拖拽回写。Review impact scope before optimization, adoption, or drag writeback."
}
```

## Result

PASS. Production preview rendered the bilingual guidance, all three contextual links, and the local help anchor on the AI scheduling workbench.
