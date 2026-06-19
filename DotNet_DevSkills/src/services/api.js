import assessmentFallback from '../../backend/assessment-data.json';

const API_BASE = '/api';

async function requestJson(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API request failed');
  }

  return response.json();
}

export async function loadWorkspace(mode = 'starter') {
  const endpoint = mode === 'solution' ? '/workspace/solution' : '/workspace';
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load workspace');
  }

  return response.json();
}

export async function loadAssessmentMeta() {
  try {
    const response = await fetch(`${API_BASE}/assessment/meta`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to load assessment metadata');
    }

    return response.json();
  } catch {
    return assessmentFallback;
  }
}

export async function loadSolutionWorkspace() {
  return loadWorkspace('solution');
}

export async function runCode(files) {
  return requestJson('/project/run', { files });
}

export async function runTests(files) {
  return requestJson('/project/tests', { files });
}

export async function submitSolution(files) {
  return requestJson('/project/submit', { files });
}

export async function buildUploadedZip(file) {
  const zipBase64 = await fileToBase64(file);
  return requestJson('/assessment/build', { zipBase64 });
}

export async function testUploadedZip(file) {
  const zipBase64 = await fileToBase64(file);
  return requestJson('/assessment/tests', { zipBase64 });
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
