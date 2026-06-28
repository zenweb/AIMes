# Issue: API HTML fallback without content type could be treated as business data

## Symptom

The frontend HTTP interceptor rejected `text/html` responses and `<!doctype html` strings, but a successful API response containing `<html...` without a `text/html` content type was still passed through.

## Risk

When the backend is unavailable and the SPA fallback is returned, downstream API wrappers can attempt to parse or render HTML as if it were business data. That hides the infrastructure failure and weakens fail-loud behavior.

## Fix

Normalize string response bodies once and reject both `<!doctype html` and `<html` prefixes in the success response interceptor.

## Status

Resolved with targeted TDD and adjacent API wrapper regression.
