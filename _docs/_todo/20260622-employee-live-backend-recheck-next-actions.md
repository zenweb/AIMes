# Employee live backend recheck next actions - 2026-06-22

1. If the operator still sees the offline-demo skip message, clear browser site data for `127.0.0.1:4173` and use the explicit live entry:
   `http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
2. If the message persists after clearing storage, rebuild or restart the frontend preview so stale output cannot serve the old employee fallback behavior.
3. Keep the employee page in the boutique-hardening lane: next useful slice is making the live recovery action base-path safe in any deployment prefix and linking the new live-backend evidence script from the Sprint 0 acceptance matrix.
