import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export async function assertClientAssetsExist(options) {
  const outputDir = options.outputDir
  const clientManifestEntry = resolve(outputDir, 'server/chunks/build/client.precomputed.mjs')
  const publicNuxtDir = resolve(outputDir, 'public/_nuxt')

  if (!existsSync(clientManifestEntry)) {
    throw new Error(`Preview build is incomplete: missing ${clientManifestEntry}. Run npm run build before npm run preview.`)
  }

  const manifestSource = readFileSync(clientManifestEntry, 'utf8')
  const manifestDataUrl = `data:text/javascript;base64,${Buffer.from(manifestSource).toString('base64')}`
  const { default: clientManifest } = await import(manifestDataUrl)
  const referencedAssets = collectReferencedAssetFiles(clientManifest)
  const missingAssets = referencedAssets
    .filter(file => !existsSync(resolve(publicNuxtDir, file)))

  if (missingAssets.length > 0) {
    const sample = missingAssets.slice(0, 10).join(', ')
    throw new Error(
      `Preview build asset check failed: ${missingAssets.length} referenced _nuxt assets are missing (${sample}). `
      + 'Run npm run build and restart preview so the HTML manifest matches .output/public/_nuxt.',
    )
  }
}

function collectReferencedAssetFiles(value, seen = new Set()) {
  if (!value || typeof value !== 'object') return []
  if (seen.has(value)) return []
  seen.add(value)

  const files = []
  if (typeof value.file === 'string' && value.file.length > 0) {
    files.push(value.file)
  }

  for (const child of Object.values(value)) {
    files.push(...collectReferencedAssetFiles(child, seen))
  }

  return [...new Set(files)]
}
