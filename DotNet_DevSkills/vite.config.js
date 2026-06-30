import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { execFile as execFileCb } from 'node:child_process';

const assessmentRootMap = {
  'main-exam': {
    starter: 'public/MainCode',
    solution: 'public/MainCode-Sol'
  },
  'hon-orders': {
    starter: 'public/testToday-main',
    solution: 'public/testToday-main - Sol'
  }
};

async function readJsonRequest(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function copyDirectory(src, dest) {
  try {
    await fs.cp(src, dest, { recursive: true });
  } catch (error) {
    if (error.code === 'ERR_FS_EISDIR' || error.code === 'ERR_FS_EEXIST') {
      const entries = await fs.readdir(src, { withFileTypes: true });
      await fs.mkdir(dest, { recursive: true });
      await Promise.all(entries.map(async (entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          await copyDirectory(srcPath, destPath);
        } else if (entry.isFile()) {
          await fs.copyFile(srcPath, destPath);
        }
      }));
    } else {
      throw error;
    }
  }
}

async function collectFiles(dir, baseDir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      const content = await fs.readFile(fullPath, 'utf8');
      files.push({ path: relativePath, content });
    }
  }

  return files;
}

function execFilePromise(command, args, options = {}) {
  return new Promise((resolve) => {
    execFileCb(command, args, options, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout?.toString() || '', stderr: stderr?.toString() || '', exitCode: error?.code || 0 });
    });
  });
}

function parseTestSummary(output) {
  const summary = { total: 0, passed: 0, failed: 0, skipped: 0, duration: null };
  const match = output.match(/Total tests:\s*(\d+),\s*Passed:\s*(\d+),\s*Failed:\s*(\d+),\s*Skipped:\s*(\d+)/i);
  if (match) {
    summary.total = Number(match[1]);
    summary.passed = Number(match[2]);
    summary.failed = Number(match[3]);
    summary.skipped = Number(match[4]);
  }
  return summary;
}

function createJudge0Payload(files, solutionFile) {
  const sourceFiles = files.filter((file) => typeof file.path === 'string' && typeof file.content === 'string');
  const mainFile = sourceFiles.find((file) => file.path.endsWith(solutionFile)) || sourceFiles[0];

  return {
    source_code: mainFile?.content || '',
    language_id: 51,
    stdin: '',
    cpu_time_limit: 5,
    memory_limit: 512000,
    wall_time_limit: 10,
    redirect_stderr_to_stdout: true,
    additional_files: sourceFiles.slice(1).map((file) => ({
      name: file.path.split('/').pop(),
      content: file.content
    }))
  };
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'dotnet-runner',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method !== 'POST' || !req.url?.startsWith('/api/run-dotnet')) {
            return next();
          }

          try {
            const body = await readJsonRequest(req);
            const assessmentKey = String(body.assessmentKey || 'main-exam');
            const mode = String(body.mode || 'starter');
            const overrides = Array.isArray(body.overrides) ? body.overrides : [];
            const modeKey = String(mode || 'starter').toLowerCase();
            const rootRelative = assessmentRootMap[assessmentKey]?.[modeKey] || assessmentRootMap[assessmentKey]?.starter;

            if (!rootRelative) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, status: 'Invalid assessment key or mode.' }));
              return;
            }

            const publicRoot = path.resolve(process.cwd(), rootRelative);
            const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-dotnet-'));
            await copyDirectory(publicRoot, tempDir);

            const fileEntries = [];
            for (const file of overrides) {
              if (!file.path || typeof file.content !== 'string') continue;
              const filePath = path.join(tempDir, file.path);
              await fs.mkdir(path.dirname(filePath), { recursive: true });
              await fs.writeFile(filePath, file.content, 'utf8');
              fileEntries.push({ path: file.path, content: file.content });
            }

            const solutionName = assessmentKey === 'hon-orders' ? 'HONOrders.sln' : 'HON.Academy.sln';
            const solutionPath = path.join(tempDir, solutionName);
            const filesToSend = await collectFiles(tempDir, tempDir);
            const filteredFilesToSend = filesToSend.filter((file) => file.path !== solutionName);

            const restoreResult = await execFilePromise('dotnet', ['restore', solutionName], { cwd: tempDir, maxBuffer: 10 * 1024 * 1024 });
            if (restoreResult.error) {
              throw new Error(`dotnet restore failed: ${restoreResult.stderr || restoreResult.stdout}`);
            }

            const testResult = await execFilePromise('dotnet', ['test', solutionName, '--no-restore'], { cwd: tempDir, maxBuffer: 20 * 1024 * 1024 });
            const output = [testResult.stdout, testResult.stderr].filter(Boolean).join('\n').trim();
            const summary = parseTestSummary(output);
            const success = testResult.exitCode === 0;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success,
              output: output || (success ? 'Tests completed successfully.' : 'dotnet test failed.'),
              status: success ? 'Success' : 'Failed',
              exitCode: testResult.exitCode,
              testSummary: summary
            }));
          } catch (error) {
            const message = error?.message || 'Dotnet runner failed.';
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, output: message, status: 'Dotnet runner error.', exitCode: 1, testSummary: { total: 0, passed: 0, failed: 1, skipped: 0, duration: null } }));
          }
        });
      }
    }
  ]
});
