import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(backendDir, '..');
const workspaceRoot = path.resolve(frontendRoot, '..');
const starterProjectRoot = path.join(workspaceRoot, 'MainExam_Todos');
const solutionProjectRoot = path.join(workspaceRoot, 'MainExam');
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

function isRelevantScaffoldFile(file) {
  const filePath = (file?.path || '').toLowerCase();
  if (!filePath) {
    return false;
  }

  if (filePath.startsWith('hon.academy.web/wwwroot/') || filePath.includes('/wwwroot/lib/') || filePath.includes('/node_modules/')) {
    return false;
  }

  return filePath.endsWith('.cs') || filePath.endsWith('.cshtml') || filePath.endsWith('.razor');
}

function hasStarterScaffolding(files) {
  return files.some((file) => {
    if (!isRelevantScaffoldFile(file)) {
      return false;
    }

    const content = typeof file?.content === 'string' ? file.content : '';
    return content.includes('TODO') || content.includes('NotImplementedException') || content.includes('throw new NotImplementedException()');
  });
}

async function ensureProjectRoot(projectRoot, label) {
  if (!(await fileExists(projectRoot))) {
    throw new Error(`Could not find ${label} workspace at ${projectRoot}`);
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

<<<<<<< HEAD
function getDotnetCommand(mode) {
  if (mode === 'test') {
    return ['test', 'HON.Academy.XunitTests/HON.Academy.XunitTests.csproj', '--verbosity', 'normal'];
  }

  return ['build', 'HON.Academy.sln'];
}

function formatDotnetResult({ command, result }, mode) {
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (output) {
    return output;
  }

  return [
    `dotnet ${command.join(' ')}`,
    result.code === 0
      ? mode === 'test'
        ? 'All tests passed successfully.'
        : 'Build completed successfully.'
      : mode === 'test'
        ? 'Some tests failed.'
        : 'Build failed.',
    'No console output was produced by dotnet.'
  ].join('\n');
}

async function runDotnetCommand(projectRoot, mode) {
  const command = getDotnetCommand(mode);
  const result = await runCommand('dotnet', command, projectRoot);
  return { command, result };
}

async function createProjectWorkspace(files = []) {
  await ensureMainExamProject();
=======
async function createProjectWorkspace(files = [], templateRoot = starterProjectRoot) {
  await ensureProjectRoot(templateRoot, 'project');
>>>>>>> 593e1f5 (Final Commit)
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-dotnet-'));
  const projectRoot = path.join(tempRoot, 'MainExam');
  await copyDirectory(templateRoot, projectRoot);
  await writeSnapshotFiles(projectRoot, files);
  return { tempRoot, projectRoot };
}

async function evaluateProject(files, mode) {
  const { tempRoot, projectRoot } = await createProjectWorkspace(files);
  try {
    const result = await runDotnetCommand(projectRoot, mode);
    return {
      success: result.result.code === 0,
      exitCode: result.result.code,
      output: formatDotnetResult(result, mode),
      workspaceRoot: projectRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function evaluateProjectBuildAndTest(files) {
  const { tempRoot, projectRoot } = await createProjectWorkspace(files);
  try {
    const buildResult = await runDotnetCommand(projectRoot, 'build');
    const buildOutput = formatDotnetResult(buildResult, 'build');

    if (buildResult.result.code !== 0) {
      return {
        success: false,
        exitCode: buildResult.result.code,
        output: buildOutput,
        buildResult: {
          success: false,
          exitCode: buildResult.result.code,
          output: buildOutput
        },
        testResult: null,
        workspaceRoot: projectRoot
      };
    }

    const testResult = await runDotnetCommand(projectRoot, 'test');
    const testOutput = formatDotnetResult(testResult, 'test');

    return {
      success: testResult.result.code === 0,
      exitCode: testResult.result.code,
      output: [buildOutput, testOutput].filter(Boolean).join('\n\n'),
      buildResult: {
        success: true,
        exitCode: buildResult.result.code,
        output: buildOutput
      },
      testResult: {
        success: testResult.result.code === 0,
        exitCode: testResult.result.code,
        output: testOutput
      },
      workspaceRoot: projectRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
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

async function loadWorkspaceFiles() {
  return cloneFiles(await walkTextFiles(starterProjectRoot));
}

async function loadSolutionFiles() {
  return cloneFiles(await walkTextFiles(solutionProjectRoot));
}

function parseTestOutput(output) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: null
  };
  const testCases = [];
  let currentFailedTest = null;

  for (const line of lines) {
    const resultMatch = line.match(/^(Passed|Failed|Skipped)\s+(.+?)\s+\[(.+?)\]$/);
    if (resultMatch) {
      const [, status, fullName, duration] = resultMatch;
      const testCase = {
        name: fullName.trim(),
        status: status.toLowerCase(),
        duration: duration.trim(),
        failureMessage: ''
      };
      testCases.push(testCase);
      if (status === 'Passed') summary.passed += 1;
      if (status === 'Failed') {
        summary.failed += 1;
        currentFailedTest = testCase;
      }
      if (status === 'Skipped') summary.skipped += 1;
      continue;
    }

    const totalMatch = line.match(/^(Total tests|Total):\s*(\d+)/i);
    if (totalMatch && !summary.total) {
      summary.total = Number(totalMatch[2]);
      continue;
    }

    const passedMatch = line.match(/^Passed:\s*(\d+)/i);
    if (passedMatch) {
      summary.passed = Number(passedMatch[1]);
      continue;
    }

    const failedMatch = line.match(/^(Failed|Failures?):\s*(\d+)/i);
    if (failedMatch) {
      summary.failed = Number(failedMatch[2]);
      continue;
    }

    const skippedMatch = line.match(/^Skipped:\s*(\d+)/i);
    if (skippedMatch) {
      summary.skipped = Number(skippedMatch[1]);
      continue;
    }

    const durationMatch = line.match(/^(Total time|duration):\s*(.+)$/i);
    if (durationMatch) {
      summary.duration = durationMatch[2].trim();
      continue;
    }

    if (currentFailedTest && !line.startsWith('xUnit.net') && !line.startsWith('A total of') && !line.startsWith('Test Run') && !/^(Total tests|Passed|Failed|Skipped|Total time|duration):/i.test(line)) {
      currentFailedTest.failureMessage += `${line}\n`;
    }
  }

  if (!summary.total && summary.passed + summary.failed + summary.skipped) {
    summary.total = summary.passed + summary.failed + summary.skipped;
  }

  return { summary, testCases };
}

<<<<<<< HEAD
=======
async function evaluateProject(files, mode) {
  const { tempRoot, projectRoot } = await createProjectWorkspace(files, starterProjectRoot);
  try {
    const command = mode === 'test'
      ? ['test', 'HON.Academy.sln', '-v', 'normal', '--logger', 'console;verbosity=normal']
      : ['build', 'HON.Academy.sln'];
    const result = await runCommand('dotnet', command, projectRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');
    const response = {
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: projectRoot
    };

    if (mode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

>>>>>>> 593e1f5 (Final Commit)
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
    let command;
    if (mode === 'test') {
      // Run tests on the specific test project
      command = ['test', 'HON.Academy.XunitTests/HON.Academy.XunitTests.csproj', '--verbosity', 'normal'];
    } else {
      command = ['build'];
    }
    const result = await runCommand('dotnet', command, solutionRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
<<<<<<< HEAD
    const fallbackOutput = mode === 'test'
      ? [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'All tests passed successfully.' : 'Some tests failed.',
          output || 'No console output was produced by dotnet.'
        ].join('\n')
      : [
          `dotnet ${command.join(' ')}`,
          result.code === 0 ? 'Build completed successfully.' : 'Build failed.',
          output || 'No console output was produced by dotnet.'
        ].join('\n');
    return {
=======
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');

    const response = {
>>>>>>> 593e1f5 (Final Commit)
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: solutionRoot
    };

    if (mode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
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
<<<<<<< HEAD
      try {
        // Load the actual MainExam project files to populate the IDE
        const files = await loadSolutionFiles();
        jsonResponse(res, 200, { files });
      } catch (err) {
        // Fallback to bundled starter workspace when MainExam cannot be read
        const files = cloneFiles(fallbackWorkspaceFiles);
        jsonResponse(res, 200, { files, error: String(err?.message || err) });
      }
=======
      const files = await loadWorkspaceFiles();
      jsonResponse(res, 200, { files });
>>>>>>> 593e1f5 (Final Commit)
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

    if (req.method === 'POST' && url.pathname === '/api/project/build-and-test') {
      const body = await readJsonBody(req);
      const result = await evaluateProjectBuildAndTest(body.files || []);
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
