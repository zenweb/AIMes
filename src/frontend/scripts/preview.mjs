import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertClientAssetsExist } from './preview-asset-check.mjs'

process.env.HOST ||= '127.0.0.1'
process.env.PORT ||= '4173'

const outputDir = process.env.NITRO_OUTPUT_DIR ?? '.output'
const serverEntry = resolve(process.cwd(), outputDir, 'server/index.mjs')

await assertClientAssetsExist({ outputDir: resolve(process.cwd(), outputDir) })
await import(pathToFileURL(serverEntry).href)
