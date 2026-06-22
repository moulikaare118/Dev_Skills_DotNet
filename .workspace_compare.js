const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname);
const mainExam = path.resolve(repoRoot, 'MainExam');
const fallbackPath = path.resolve(repoRoot, 'DotNet_DevSkills', 'src', 'data', 'fallbackWorkspace.js');

const textExts = new Set(['.cs', '.csproj', '.sln', '.json', '.cshtml', '.css', '.js', '.jsx', '.md', '.config', '.txt', '.xml', '.yml', '.yaml']);
const skipFolders = new Set(['bin', 'obj', '.git', 'node_modules']);

function walk(dir, root) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skipFolders.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full, root));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!textExts.has(ext)) continue;
    results.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return results;
}

function parseFallback() {
  const txt = fs.readFileSync(fallbackPath, 'utf8');
  const re = /path:\s*'([^']+)'/g;
  const arr = [];
  let m;
  while ((m = re.exec(txt)) !== null) arr.push(m[1]);
  return arr;
}

const mainFiles = walk(mainExam, mainExam).sort();
const fallbackFiles = parseFallback().sort();
const mainSet = new Set(mainFiles);
const fallbackSet = new Set(fallbackFiles);

const onlyInMain = mainFiles.filter(f => !fallbackSet.has(f));
const onlyInFallback = fallbackFiles.filter(f => !mainSet.has(f));
const inBoth = mainFiles.filter(f => fallbackSet.has(f));

console.log('MainExam files count:', mainFiles.length);
console.log('Fallback files count:', fallbackFiles.length);
console.log('Common files count:', inBoth.length);
console.log('Only in MainExam count:', onlyInMain.length);
console.log('Only in Fallback count:', onlyInFallback.length);

console.log('\n--- Only in MainExam (first 200) ---');
onlyInMain.slice(0,200).forEach(p => console.log(p));

console.log('\n--- Only in Fallback (should be none) ---');
onlyInFallback.forEach(p => console.log(p));
