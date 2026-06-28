# Next actions: HTTP HTML fallback detection

- [x] Add failing test for successful API response containing `<html>` fallback without `text/html`.
- [x] Extend fallback detection to reject `<html` responses as backend-unavailable evidence.
- [x] Verify target HTTP interceptor test.
- [x] Verify adjacent API wrapper tests.
- [ ] Continue coverage-leverage hardening on the next low-coverage user-critical slice.
- [ ] Keep gray observation explicitly deferred unless owner starts and completes the observation window.
