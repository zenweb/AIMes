# Production API contract next actions

- Continue hardening ProductionBoard by coverage leverage rather than adding new production features.
- Next high-value production slice should target remaining uncovered operator-facing branches in `ProductionBoard.vue`, especially startup/load failure aggregation or completion evidence edge cases.
- Use real browser evidence only when the next slice changes UI behavior or operator interaction, not for pure API helper contracts.
