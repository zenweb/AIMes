# Plan: Nuxt dev rollup input blocker

Date: 2026-06-19
Status: Paused pending dependency strategy

## Success criteria

- `npm run dev` stays alive.
- `http://127.0.0.1:5173/scheduling/login` returns HTTP 200.
- Logs do not contain `No entry found in rollupOptions.input`.

## Current result

Success criteria are not met.

- Without a temporary hook, `npm run dev` exits with `No entry found in rollupOptions.input`.
- With temporary server-input hooks, `npm run dev` builds but all tested HTTP routes time out.
- Production preview is healthy and remains the browser-evidence path.

## Next plan

1. Do not re-add server-input hooks unless verified in a clean minimal Nuxt reproduction.
2. Decide dependency strategy before more attempts: pin/align Nuxt Vite dependencies or upgrade Nuxt/Nuxi together.
3. Continue feature-quality work using production preview for browser evidence.
4. Do not claim strict v1.0.0 release readiness while gray observation is deferred.
