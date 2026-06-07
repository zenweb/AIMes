# Plan: Hosted CI container Nuxt output path

## Success criteria

- Docker build copies Nuxt 3 static assets from the real output directory.
- Hosted CI container job succeeds.
- Full Hosted CI run concludes `success`.

## Steps

1. Read Hosted CI container failure logs.
2. Confirm frontend build output path from Nuxt config and CI logs.
3. Align Dockerfile and API project static asset copy targets.
4. Run local non-Docker verification.
5. Push and validate Hosted CI.

## Current state

Steps 1-4 are complete. Step 5 is pending.

