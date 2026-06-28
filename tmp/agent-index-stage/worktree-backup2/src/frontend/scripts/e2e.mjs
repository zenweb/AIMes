import { spawn, execSync } from 'node:child_process'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { runCommand } from '@nuxt/cli'

const e2eBuildId = process.env.AIMES_E2E_BUILD_ID ?? process.pid.toString()
const e2ePort = process.env.AIMES_E2E_PORT ?? await findAvailablePort(4173)
const targetsRealDhtmlx = process.argv.slice(2).some(arg =>
  arg.includes('真实 dhtmlx') ||
  arg.includes('live staging') ||
  arg.includes('scheduling-live-staging.spec')
)
const targetsLiveBackendMock = process.argv.slice(2).some(arg =>
  arg.includes('人员证据启动读取失败后可重试') ||
  arg.includes('调度员 Agent 工作台通过后端 API') ||
  arg.includes('调度员 Agent 工作台后端 403') ||
  arg.includes('调度员 Agent 工作台 API 不可用')
)
const e2eOfflineDemo = process.env.AIMES_E2E_OFFLINE_DEMO === 'false' || targetsRealDhtmlx || targetsLiveBackendMock ? 'false' : 'true'
const e2eShowDemoHints = process.env.AIMES_E2E_SHOW_DEMO_HINTS === 'false' || targetsRealDhtmlx ? 'false' : 'true'

const testEnv = {
  ...process.env,
  AIMES_E2E_PORT: e2ePort,
  VITE_SHOW_DEMO_HINTS: e2eShowDemoHints,
  VITE_OFFLINE_DEMO: e2eOfflineDemo,
  NUXT_BUILD_DIR: process.env.NUXT_BUILD_DIR ?? `.nuxt-e2e-${e2eBuildId}`,
  NITRO_OUTPUT_DIR: process.env.NITRO_OUTPUT_DIR ?? resolve(process.cwd(), `.output-e2e-${e2eBuildId}`),
}

Object.assign(process.env, {
  AIMES_E2E_PORT: testEnv.AIMES_E2E_PORT,
  VITE_SHOW_DEMO_HINTS: testEnv.VITE_SHOW_DEMO_HINTS,
  VITE_OFFLINE_DEMO: testEnv.VITE_OFFLINE_DEMO,
  NUXT_BUILD_DIR: testEnv.NUXT_BUILD_DIR,
  NITRO_OUTPUT_DIR: testEnv.NITRO_OUTPUT_DIR,
})

function canListen(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    if (await canListen(port)) return String(port)
  }
  throw new Error(`No available local port found from ${startPort}`)
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: testEnv,
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })

    child.on('error', reject)
  })
}

// Windows EPERM 保护：构建前清理旧的临时目录
if (process.platform === 'win32') {
  const buildDir = testEnv.NUXT_BUILD_DIR ?? `.nuxt-e2e-${e2eBuildId}`
  const outputDir = testEnv.NITRO_OUTPUT_DIR ?? resolve(process.cwd(), `.output-e2e-${e2eBuildId}`)
  for (const dir of [buildDir, outputDir]) {
    try { execSync(`powershell.exe -NoProfile -Command "Remove-Item '${dir}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' }) } catch { /* 忽略清理失败 */ }
  }
}

await runCommand('build', [])
await run(process.execPath, ['./node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)])
