import { spawn } from 'node:child_process'

const vitepressBase = process.env.VITEPRESS_BASE || '/'
const playgroundBase = `${vitepressBase}tiny-robot/playground`

spawn('pnpm', ['-F', 'robot-root', 'build:playground'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PLAYGROUND_BASE: playgroundBase,
    VITE_PLAYGROUND_SHARE_PATH: `${playgroundBase}/`
  }
}).on('exit', (code) => process.exit(code || 0))
