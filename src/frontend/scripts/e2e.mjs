import { spawn } from 'node:child_process'

const testEnv = {
  ...process.env,
  VITE_SHOW_DEMO_HINTS: 'true',
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
