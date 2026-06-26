const API_BASE = 'api';

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

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch JSON');
  }
  return response.json();
}

export async function loadAssessmentMetaFallback() {
  return fetchJson('assessment-data.json');
}

export async function loadWorkspace(assessmentKey = 'main-exam', mode = 'starter') {
  const endpoint = mode === 'solution' ? '/workspace/solution' : '/workspace';
  const searchParams = new URLSearchParams();

  if (assessmentKey) {
    searchParams.set('assessment', assessmentKey);
  }

  if (mode === 'solution') {
    searchParams.set('mode', 'solution');
  }

  const queryString = searchParams.toString();
  const requestPath = queryString ? `${endpoint}?${queryString}` : endpoint;
  const response = await fetch(`${API_BASE}${requestPath}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load workspace');
  }

  return response.json();
}

export async function loadAssessmentMeta() {
  try {
    return await fetchJson(`${API_BASE}/assessment/meta`);
  } catch (error) {
    return loadAssessmentMetaFallback();
  }
}

export async function loadSolutionWorkspace(assessmentKey = 'main-exam') {
  return loadWorkspace(assessmentKey, 'solution');
}

export async function runCode(files, assessmentKey = 'main-exam', mode = 'starter') {
  return requestJson('/project/run', { files, assessmentKey, mode });
}

export async function runTests(files, assessmentKey = 'main-exam', mode = 'starter') {
  return requestJson('/project/tests', { files, assessmentKey, mode });
}

export async function buildAndRunTests(files, assessmentKey = 'main-exam', mode = 'starter') {
  return requestJson('/project/build-and-test', { files, assessmentKey, mode });
}

export async function submitSolution(files, assessmentKey = 'main-exam', mode = 'starter') {
  return requestJson('/project/submit', { files, assessmentKey, mode });
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
