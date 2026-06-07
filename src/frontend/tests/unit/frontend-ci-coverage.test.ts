import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(__dirname, '../../../..')

function readText(path: string) {
  return readFileSync(resolve(repoRoot, path), 'utf8')
}

describe('frontend CI coverage gate', () => {
  it('runs unit coverage in CI so frontend tests cannot skip threshold evidence', () => {
    const packageJson = JSON.parse(readText('src/frontend/package.json')) as {
      scripts?: Record<string, string>
    }
    const ciWorkflow = readText('.github/workflows/ci.yml')
    const coverageScript = packageJson.scripts?.['test:unit:coverage']

    expect(coverageScript).toBeDefined()
    expect(coverageScript).toContain('vitest run --coverage')
    expect(ciWorkflow).toContain('npm run test:unit:coverage')
  })

  it('keeps the frontend coverage threshold above the initial safety floor', () => {
    const vitestConfig = readText('src/frontend/vitest.config.ts')

    expect(vitestConfig).toContain('lines: 15')
    expect(vitestConfig).toContain('branches: 15')
    expect(vitestConfig).toContain('functions: 15')
    expect(vitestConfig).toContain('statements: 15')
  })
})
