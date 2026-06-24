import { spawn } from 'node:child_process';
import net from 'node:net';
import process from 'node:process';

const processes = [];

async function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      tester.close(() => resolve(false));
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen({ port, host });
  });
}

async function getBackendPort(preferred = 8787, max = 8887) {
  if (await isPortFree(preferred)) {
    return preferred;
  }

  for (let port = preferred + 1; port <= max; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`No available backend port found in range ${preferred}-${max}`);
}

const backendPort = await getBackendPort(Number(process.env.PORT || 8787));
const env = {
  ...process.env,
  PORT: String(backendPort),
  BACKEND_PORT: String(backendPort)
};

function start(command, args, label, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env
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
