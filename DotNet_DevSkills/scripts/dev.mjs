import { spawn } from 'node:child_process';
import process from 'node:process';

const processes = [];

function start(command, args, label, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env
  });

  child.on('exit', (code, signal) => {
    if ((signal || code !== 0) && !options.allowFailure) {
      shutdown();
      process.exit(code ?? 1);
    }

    if ((signal || code !== 0) && options.allowFailure) {
      console.warn(`[${label}] exited with code ${code ?? 'signal'}. Frontend will keep running.`);
    }
  });

  processes.push(child);
  console.log(`[${label}] started`);
  return child;
}

function shutdown() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

start('node', ['backend/server.js'], 'backend', { allowFailure: true });
start('vite', [], 'frontend');
