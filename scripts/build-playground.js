import { spawn } from 'node:child_process'

const vitepressBase = process.env.VITEPRESS_BASE || '/'
const playgroundBase = process.env.TINY_ROBOT_PLAYGROUND_BASE || `${vitepressBase}tiny-robot/playground`

const child = spawn('pnpm', ['-F', 'robot-root', 'build:playground'], {
  stdio: 'inherit',
  shell: true,
  env: {
    PLAYGROUND_BASE: playgroundBase,
    VITE_PLAYGROUND_SHARE_PATH: process.env.VITE_PLAYGROUND_SHARE_PATH || `${playgroundBase}/`
  }
})

child.on('error', () => process.exit(1))
child.on('close', (code, signal) => {
  if (signal) process.exit(1)
  process.exit(code ?? 1)
})
