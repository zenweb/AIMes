import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

const e2eBuildId = process.env.AIMES_E2E_BUILD_ID ?? process.pid.toString()
const e2ePort = process.env.AIMES_E2E_PORT ?? await findAvailablePort(4173)

const testEnv = {
  ...process.env,
  AIMES_E2E_PORT: e2ePort,
  VITE_SHOW_DEMO_HINTS: 'true',
  NUXT_BUILD_DIR: process.env.NUXT_BUILD_DIR ?? `.nuxt-e2e-${e2eBuildId}`,
  NITRO_OUTPUT_DIR: process.env.NITRO_OUTPUT_DIR ?? resolve(process.cwd(), `.output-e2e-${e2eBuildId}`),
}

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

await run(process.execPath, ['./node_modules/nuxt/bin/nuxt.mjs', 'build'])
await run(process.execPath, ['./node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)])
