export function resolveSignalRHubUrl(
  path: string,
  _locationRef: Location = window.location,
  apiTarget = import.meta.env.VITE_API_TARGET,
): string {
  const target = apiTarget?.trim()
  if (target) {
    return new URL(path, target.endsWith('/') ? target : `${target}/`).toString()
  }

  return path
}
