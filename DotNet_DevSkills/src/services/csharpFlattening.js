function normalizePath(filePath = '') {
  return String(filePath || '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/+/g, '/');
}

function getFileCategory(filePath = '') {
  const normalized = normalizePath(filePath).toLowerCase();

  if (normalized.includes('/tests/') || normalized.endsWith('.tests.cs') || normalized.includes('tests/')) {
    return 'Tests';
  }

  if (normalized.endsWith('/program.cs') || normalized === 'program.cs') {
    return 'Program';
  }

  if (normalized.includes('/models/') || normalized.startsWith('models/')) {
    return 'Models';
  }

  if (normalized.includes('/interfaces/') || normalized.startsWith('interfaces/')) {
    return 'Interfaces';
  }

  if (normalized.includes('/services/') || normalized.startsWith('services/')) {
    return 'Services';
  }

  if (normalized.includes('/repositories/') || normalized.startsWith('repositories/')) {
    return 'Repositories';
  }

  if (normalized.includes('/helpers/') || normalized.startsWith('helpers/')) {
    return 'Helpers';
  }

  if (normalized.includes('/tests/') || normalized.startsWith('tests/')) {
    return 'Tests';
  }

  return 'Other';
}

function getPriority(filePath = '') {
  const category = getFileCategory(filePath);
  const priorities = {
    Models: 0,
    Interfaces: 1,
    Services: 2,
    Repositories: 3,
    Helpers: 4,
    Tests: 5,
    Program: 6,
    Other: 7
  };

  return priorities[category] ?? 7;
}

function stripUsingDirectives(source = '') {
  const lines = source.split(/\r?\n/);
  const kept = lines.filter((line) => !line.trim().startsWith('using '));

  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractUsings(source = '') {
  const usings = [];
  const seen = new Set();
  const lines = source.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('using ')) {
      return;
    }

    const normalized = trimmed.replace(/;\s*$/, '');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      usings.push(normalized);
    }
  });

  return usings;
}

export function flattenCSharpProject(files = []) {
  const editableFiles = (files || [])
    .filter((file) => file && typeof file.content === 'string' && !file.readOnly)
    .filter((file) => /\.cs$/i.test(file.path || file.name || ''));

  const orderedFiles = [...editableFiles].sort((a, b) => {
    const left = getPriority(a.path || a.name || '');
    const right = getPriority(b.path || b.name || '');

    if (left !== right) {
      return left - right;
    }

    return normalizePath(a.path || a.name || '').localeCompare(normalizePath(b.path || b.name || ''));
  });

  const uniqueUsings = Array.from(
    orderedFiles.reduce((acc, file) => {
      extractUsings(file.content || '').forEach((usingLine) => acc.add(usingLine));
      return acc;
    }, new Set())
  );

  const sectionLines = [];
  const lineMap = [null];

  if (uniqueUsings.length > 0) {
    sectionLines.push(...uniqueUsings.map((usingLine) => `${usingLine};`));
    sectionLines.push('');
  }

  orderedFiles.forEach((file) => {
    const sourcePath = normalizePath(file.path || file.name || '');
    const contentWithoutUsings = stripUsingDirectives(file.content || '');
    const trimmedContent = contentWithoutUsings.trim();

    if (!trimmedContent) {
      return;
    }

    sectionLines.push(`// Source file: ${sourcePath}`);
    sectionLines.push(trimmedContent);
    sectionLines.push('');
    lineMap.push({ path: sourcePath, line: 1 });
  });

  const sourceCode = sectionLines.join('\n').trim();

  return {
    sourceCode,
    lineMap
  };
}
