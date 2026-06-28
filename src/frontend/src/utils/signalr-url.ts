export function resolveSignalRHubUrl(path: string, locationRef: Location = window.location): string {
  if (locationRef.port !== '4173') return path
  return `${locationRef.protocol}//${locationRef.hostname}:5003${path}`
}
