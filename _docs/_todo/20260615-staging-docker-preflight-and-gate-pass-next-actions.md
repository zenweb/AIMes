# Next actions: staging Docker preflight and gate pass

- [x] Fix staging Docker preflight false-negative behavior.
- [x] Add regression evidence so completed `docker info` is not misclassified.
- [x] Re-run staging rehearsal on API port `5003`.
- [x] Re-run release gate audit with gray observation deferred by owner.
- [ ] Continue A-track boutique hardening by coverage leverage: pick the next lowest-coverage user-critical component or the next real browser evidence gap.
- [ ] If strict final v1.0.0 release is needed later, run a real gray observation package instead of relying on `DEFERRED_BY_OWNER`.
