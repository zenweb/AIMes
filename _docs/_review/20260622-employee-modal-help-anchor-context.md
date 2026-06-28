# Employee modal help anchor context review

## Finding

No blocking issue found in the focused review.

## Review Notes

- The previous shared `#employee-operation-help` href could leave the create dialog pointing outside its own visible context.
- The fix keeps links local to each dialog and avoids adding new UI surface area.
- Existing create/edit guidance and deactivate confirmation behavior remain covered by the employee board unit test.

## Residual Risk

- Real browser preview was not rerun for this micro-fix because the behavior is DOM-anchor level and the production build passed. A future visual pass can include anchor-click behavior.

