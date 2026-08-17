import { spawn } from 'node:child_process'

function run(command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, CHOKIDAR_USEPOLLING: 'true' },
  })
  child.on('error', (err) => {
    console.error(err)
  })
}

run('node', ['server/index.mjs'])
run('npx', ['vite'])
