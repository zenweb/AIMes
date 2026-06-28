import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

let tempDirs: string[] = []

async function createPreviewOutput(files: string[]) {
  const outputDir = await mkdtemp(join(tmpdir(), 'aimes-preview-assets-'))
  tempDirs.push(outputDir)
  await mkdir(join(outputDir, 'server/chunks/build'), { recursive: true })
  await mkdir(join(outputDir, 'public/_nuxt'), { recursive: true })
  await writeFile(
    join(outputDir, 'server/chunks/build/client.precomputed.mjs'),
    [
      'export default {',
      '  modules: {',
      '    "entry": { file: "entry.js" },',
      '    "employee": { file: "employee.js" },',
      '    "ignored": { file: "" }',
      '  }',
      '}',
    ].join('\n'),
  )
  await Promise.all(files.map(file => writeFile(join(outputDir, 'public/_nuxt', file), '')))
  return outputDir
}

async function createPreviewOutputWithNestedAssetReference(files: string[]) {
  const outputDir = await mkdtemp(join(tmpdir(), 'aimes-preview-assets-'))
  tempDirs.push(outputDir)
  await mkdir(join(outputDir, 'server/chunks/build'), { recursive: true })
  await mkdir(join(outputDir, 'public/_nuxt'), { recursive: true })
  await writeFile(
    join(outputDir, 'server/chunks/build/client.precomputed.mjs'),
    [
      'export default {',
      '  dependencies: {',
      '    "entry": {',
      '      preload: { "entry": { file: "entry.js" }, "style": { file: "entry.css" } },',
      '      prefetch: { "font": { file: "primeicons.woff2" } }',
      '    }',
      '  },',
      '  modules: {}',
      '}',
    ].join('\n'),
  )
  await Promise.all(files.map(file => writeFile(join(outputDir, 'public/_nuxt', file), '')))
  return outputDir
}

afterEach(async () => {
  await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
  tempDirs = []
})

describe('preview asset check', () => {
  it('passes when every client manifest asset exists', async () => {
    const outputDir = await createPreviewOutput(['entry.js', 'employee.js'])
    const { assertClientAssetsExist } = await import('../../scripts/preview-asset-check.mjs')

    await expect(assertClientAssetsExist({ outputDir })).resolves.toBeUndefined()
  })

  it('fails loud when the preview manifest references a missing client asset', async () => {
    const outputDir = await createPreviewOutput(['entry.js'])
    const { assertClientAssetsExist } = await import('../../scripts/preview-asset-check.mjs')

    await expect(assertClientAssetsExist({ outputDir })).rejects.toThrow(
      'Preview build asset check failed: 1 referenced _nuxt assets are missing (employee.js).',
    )
  })

  it('fails loud when nested preload, style, or font asset references are missing', async () => {
    const outputDir = await createPreviewOutputWithNestedAssetReference(['entry.js', 'entry.css'])
    const { assertClientAssetsExist } = await import('../../scripts/preview-asset-check.mjs')

    await expect(assertClientAssetsExist({ outputDir })).rejects.toThrow(
      'Preview build asset check failed: 1 referenced _nuxt assets are missing (primeicons.woff2).',
    )
  })
})
