/**
 * zipGenerator.js
 * Creates ZIP files from project structure in browser memory.
 */

import JSZip from 'jszip';

export function generateCompileScript() {
  return `#!/bin/bash
set -e

if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet SDK is not available in this execution environment."
  echo "Please use a container/runtime that includes the .NET SDK."
  exit 127
fi

dotnet restore
dotnet build --no-restore
`;
}

export function generateRunScript() {
  return `#!/bin/bash
set -e

if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet SDK is not available in this execution environment."
  echo "Please use a container/runtime that includes the .NET SDK."
  exit 127
fi

dotnet test --no-build --logger "console;verbosity=detailed"
`;
}

export async function createProjectZip(files = [], options = {}) {
  const zip = new JSZip();
  const { includeScripts = true } = options;
  const existingEntries = new Set();

  if (Array.isArray(files)) {
    files.forEach((file) => {
      if (!file || !file.path) return;

      const normalizedPath = String(file.path || '').replace(/\\/g, '/');
      const shouldSkip = ['/bin/', '/obj/', '/.git/', 'node_modules/', '.DS_Store'].some((pattern) => normalizedPath.includes(pattern));

      if (shouldSkip) return;

      existingEntries.add(normalizedPath);
      zip.file(normalizedPath, file.content || '');
    });
  }

  if (includeScripts) {
    if (!existingEntries.has('compile.sh')) {
      zip.file('compile.sh', generateCompileScript());
    }

    if (!existingEntries.has('run.sh')) {
      zip.file('run.sh', generateRunScript());
    }
  }

  return zip;
}

export async function encodeZipAsBase64(zip) {
  try {
    let zipInstance = zip;

    if (Array.isArray(zip)) {
      zipInstance = await createProjectZip(zip);
    }

    if (!zipInstance || typeof zipInstance.generateAsync !== 'function') {
      throw new Error('Invalid ZIP instance');
    }

    const blob = await zipInstance.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('ZIP encoding failed:', error);
    throw new Error(`Failed to encode ZIP: ${error.message}`);
  }
}

export async function getZipSize(zip) {
  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob.size;
  } catch (error) {
    console.error('Failed to calculate ZIP size:', error);
    return 0;
  }
}

export function validateProjectStructure(files = []) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!Array.isArray(files) || files.length === 0) {
    result.isValid = false;
    result.errors.push('No files in project');
    return result;
  }

  if (!files.some((file) => file.path?.endsWith('.sln'))) {
    result.warnings.push('No .sln file found - project may not build correctly');
  }

  if (!files.some((file) => file.path?.endsWith('.csproj'))) {
    result.warnings.push('No .csproj files found - missing project files');
  }

  if (!files.some((file) => file.path?.includes('Tests') || file.path?.includes('tests'))) {
    result.warnings.push('No test files found - test execution may fail');
  }

  return result;
}

export async function createAndEncodeProjectZip(files = [], options = {}) {
  try {
    const validation = validateProjectStructure(files);

    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }

    const zip = await createProjectZip(files, options);
    const size = await getZipSize(zip);
    const base64 = await encodeZipAsBase64(zip);

    return {
      zip,
      base64,
      size,
      validation,
      success: true
    };
  } catch (error) {
    console.error('ZIP creation failed:', error);
    return {
      zip: null,
      base64: null,
      size: 0,
      validation: { isValid: false, errors: [error.message], warnings: [] },
      success: false,
      error: error.message
    };
  }
}

export async function listZipContents(zip) {
  const files = [];
  zip.forEach((relativePath) => {
    files.push(relativePath);
  });
  return files;
}

export async function extractFileFromZip(zip, filePath) {
  try {
    const file = zip.file(filePath);
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }
    return await file.async('string');
  } catch (error) {
    console.error(`Failed to extract ${filePath}:`, error);
    return null;
  }
}

export default {
  generateCompileScript,
  generateRunScript,
  createProjectZip,
  encodeZipAsBase64,
  getZipSize,
  validateProjectStructure,
  createAndEncodeProjectZip,
  listZipContents,
  extractFileFromZip
};
