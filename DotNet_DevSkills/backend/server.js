import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { fallbackWorkspaceFiles } from '../src/data/fallbackWorkspace.js';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(backendDir, '..');
const workspaceRoot = path.resolve(frontendRoot, '..');
const sourceProjectRoot = path.join(workspaceRoot, 'MainExam');
const assessmentDataPath = path.join(backendDir, 'assessment-data.json');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8787);

const textExtensions = new Set(['.cs', '.csproj', '.sln', '.json', '.cshtml', '.css', '.js', '.jsx', '.md', '.config', '.txt', '.xml', '.yml', '.yaml']);
const skipFolders = new Set(['bin', 'obj', '.git', 'node_modules']);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkTextFiles(rootDir, currentDir = rootDir, results = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkTextFiles(rootDir, entryPath, results);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await fs.readFile(entryPath, 'utf8');
    const relativePath = toPosix(path.relative(rootDir, entryPath));
    results.push({
      id: relativePath,
      name: entry.name,
      path: relativePath,
      readOnly: false,
      content
    });
  }

  return results;
}

function cloneFiles(files) {
  return files.map((file) => ({ ...file }));
}

function hasStarterScaffolding(files) {
  return files.some((file) => {
    const content = typeof file?.content === 'string' ? file.content : '';
    return content.includes('TODO') || content.includes('NotImplementedException') || content.includes('throw new NotImplementedException()');
  });
}

async function ensureMainExamProject() {
  if (!(await fileExists(sourceProjectRoot))) {
    throw new Error(`Could not find MainExam workspace at ${sourceProjectRoot}`);
  }
}

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const sourceEntry = path.join(source, entry.name);
    const targetEntry = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourceEntry, targetEntry);
      continue;
    }

    await fs.copyFile(sourceEntry, targetEntry);
  }
}

async function writeSnapshotFiles(tempProjectRoot, files) {
  for (const file of files || []) {
    if (!file?.path || typeof file.content !== 'string') {
      continue;
    }

    const targetPath = path.join(tempProjectRoot, file.path);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.content, 'utf8');
  }
}

async function unzipArchive(zipPath, destinationDir) {
  await new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-q', zipPath, '-d', destinationDir], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    unzip.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    unzip.on('error', reject);
    unzip.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `unzip exited with code ${code}`));
    });
  });
}

async function findSolutionRoot(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.sln')) {
      return rootDir;
    }
    if (entry.isDirectory()) {
      const nested = await findSolutionRoot(entryPath).catch(() => null);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function createProjectWorkspace(files = []) {
  await ensureMainExamProject();
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-dotnet-'));
  const projectRoot = path.join(tempRoot, 'MainExam');
  await copyDirectory(sourceProjectRoot, projectRoot);
  await writeSnapshotFiles(projectRoot, files);
  return { tempRoot, projectRoot };
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
}

async function loadAssessmentData() {
  const raw = await fs.readFile(assessmentDataPath, 'utf8');
  return JSON.parse(raw);
}

async function loadSolutionFiles() {
  return cloneFiles(await walkTextFiles(sourceProjectRoot));
}

async function evaluateProject(files, mode) {
  const { tempRoot, projectRoot } = await createProjectWorkspace(files);
  try {
    if (mode === 'test' && hasStarterScaffolding(files)) {
      return {
        success: false,
        exitCode: 1,
        output: [
          'Test run blocked.',
          'Starter TODO / scaffold code is still present.',
          'Complete the implementation before running tests.'
        ].join('\n'),
        workspaceRoot: projectRoot
      };
    }

    const command = mode === 'test'
      ? ['test', 'HON.Academy.sln', '-v', 'normal', '--logger', 'console;verbosity=normal']
      : ['build', 'HON.Academy.sln'];
    const result = await runCommand('dotnet', command, projectRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const fallbackOutput = mode === 'test'
      ? [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'Test run completed successfully.' : 'Test run failed.',
          'No console output was produced by dotnet.'
        ].join('\n')
      : [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'Build completed successfully.' : 'Build failed.',
          'No console output was produced by dotnet.'
        ].join('\n');
    return {
      success: result.code === 0,
      exitCode: result.code,
      output: output || fallbackOutput,
      workspaceRoot: projectRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function evaluateZip(zipBase64, mode) {
  if (!zipBase64) {
    throw new Error('Missing zip payload.');
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-zip-'));
  const zipPath = path.join(tempRoot, 'submission.zip');
  const extractRoot = path.join(tempRoot, 'extract');
  await fs.mkdir(extractRoot, { recursive: true });
  await fs.writeFile(zipPath, Buffer.from(zipBase64, 'base64'));
  await unzipArchive(zipPath, extractRoot);

  const solutionRoot = (await findSolutionRoot(extractRoot)) || extractRoot;
  try {
    const command = mode === 'test'
      ? ['test', '-v', 'normal', '--logger', 'console;verbosity=normal']
      : ['build'];
    const result = await runCommand('dotnet', command, solutionRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const fallbackOutput = mode === 'test'
      ? [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'Test run completed successfully.' : 'Test run failed.',
          'No console output was produced by dotnet.'
        ].join('\n')
      : [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'Build completed successfully.' : 'Build failed.',
          'No console output was produced by dotnet.'
        ].join('\n');
    return {
      success: result.code === 0,
      exitCode: result.code,
      output: output || fallbackOutput,
      workspaceRoot: solutionRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace') {
      const files = cloneFiles(fallbackWorkspaceFiles);
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace/solution') {
      const files = await loadSolutionFiles();
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/assessment/meta') {
      const data = await loadAssessmentData();
      jsonResponse(res, 200, data);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/run') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'build');
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test');
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/submit') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test');
      jsonResponse(res, 200, {
        ...result,
        status: result.success ? 'Submitted' : 'Blocked'
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/build') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'build');
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'test');
      jsonResponse(res, 200, result);
      return;
    }

    jsonResponse(res, 404, { error: 'Not found' });
  } catch (error) {
    jsonResponse(res, 500, { error: error?.message || 'Unexpected server error' });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`DevSkills backend listening on http://${host}:${port}\n`);
});
