# 2026-06-15 API Host Port Override

## Changed

- Kept the default backend/API host port on `5002`.
- Updated `docker-compose.yml` so the API host port can be overridden with `AIMES_API_HOST_PORT`, for example `AIMES_API_HOST_PORT=5003`, while the container still listens on `5002`.
- Updated README, quickstart, SOP, and troubleshooting guidance to avoid falling back to host port `5000` when `5002` is occupied.

## Validation

- Confirmed current runtime config defaults use `5002` in Docker Compose, Dockerfile, launch settings, Nuxt proxy, and staging scripts.
- Confirmed host `5002` is currently occupied by `learun.webapi.exe`; future AIMes runs should either free `5002` or explicitly use a non-5000 override such as `5003`.
