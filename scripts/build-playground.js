import { spawn } from 'node:child_process'

const vitepressBase = process.env.VITEPRESS_BASE || '/'
const playgroundBase = process.env.TINY_ROBOT_PLAYGROUND_BASE || `${vitepressBase}tiny-robot/playground`

spawn('pnpm', ['-F', 'robot-root', 'build:playground'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PLAYGROUND_BASE: playgroundBase,
    VITE_PLAYGROUND_SHARE_PATH: process.env.VITE_PLAYGROUND_SHARE_PATH || `${playgroundBase}/`
  }
}).on('exit', (code) => process.exit(code || 0))
