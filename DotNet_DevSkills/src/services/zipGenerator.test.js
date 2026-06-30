import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCompileScript, generateRunScript, createProjectZip } from './zipGenerator.js';

test('build and test scripts use the required dotnet commands', () => {
  const compileScript = generateCompileScript();
  const runScript = generateRunScript();

  assert.match(compileScript, /command -v dotnet/);
  assert.match(compileScript, /dotnet restore/);
  assert.match(compileScript, /dotnet build --no-restore/);
  assert.doesNotMatch(compileScript, /--configuration Release/);

  assert.match(runScript, /command -v dotnet/);
  assert.match(runScript, /dotnet test --no-build/);
  assert.match(runScript, /console;verbosity=detailed/);
  assert.doesNotMatch(runScript, /--configuration Release/);
});

test('project zip preserves nested folders and adds automation scripts', async () => {
  const zip = await createProjectZip([
    { path: 'HON.Academy.sln', content: 'solution' },
    { path: 'HON.Academy.DAL/Services/CourseServices.cs', content: 'class CourseServices {}' }
  ]);

  const names = [];
  zip.forEach((relativePath) => names.push(relativePath));

  assert.ok(names.includes('HON.Academy.sln'));
  assert.ok(names.includes('HON.Academy.DAL/Services/CourseServices.cs'));
  assert.ok(names.includes('compile.sh'));
  assert.ok(names.includes('run.sh'));
});
