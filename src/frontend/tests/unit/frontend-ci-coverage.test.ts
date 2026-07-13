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

  it('uploads the real Nuxt public build and fails when the release artifact is missing', () => {
    const packageJson = JSON.parse(readText('src/frontend/package.json')) as {
      scripts?: Record<string, string>
    }
    const ciWorkflow = readText('.github/workflows/ci.yml')
    const dockerfile = readText('Dockerfile')

    expect(packageJson.scripts?.['build:static']).toContain('build --preset static')
    expect(ciWorkflow).toContain('npm run build:static')
    expect(ciWorkflow).toContain('src/frontend/.output/public/index.html')
    expect(ciWorkflow).toContain('path: src/frontend/.output/public/')
    expect(ciWorkflow).toContain('if-no-files-found: error')
    expect(ciWorkflow).not.toContain('path: src/frontend/dist/')
    expect(dockerfile).toContain('RUN npm run build:static')
  })

  it('uses supported Node 24 generation GitHub Actions in CI', () => {
    const ciWorkflow = readText('.github/workflows/ci.yml')

    expect(ciWorkflow).toContain('actions/checkout@v7')
    expect(ciWorkflow).toContain('actions/setup-node@v6')
    expect(ciWorkflow).toContain('actions/setup-dotnet@v5')
    expect(ciWorkflow).toContain('actions/cache@v6')
    expect(ciWorkflow).toContain('actions/upload-artifact@v7')
    expect(ciWorkflow).not.toMatch(/actions\/(checkout|setup-node|setup-dotnet|cache|upload-artifact)@v4/)
  })
})
