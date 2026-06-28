# 2026-06-12 Schedule Read Model Display Names Next Actions

## Done
- Backend scheduling read model now returns item display names needed by the real gantt UI.
- Unit and HTTP integration tests prove the mapping.

## Next
- Rebuild the Docker API before the next staging run so the read-model fix is present in the container.
- Add a live staging browser evidence slice: seed a probe plan/user, run the real scheduling page against `localhost:5002`, drag a real dhtmlx task, refresh, and verify API/DB readback.
- Keep this as scheduling boutique hardening, not new feature expansion.
