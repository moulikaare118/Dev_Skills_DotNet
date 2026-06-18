const API_BASE = '';

async function jsonFetch(url, payload) {
  const response = await fetch(url, {
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

export async function runCode(code) {
  return jsonFetch(`${API_BASE}/api/code/run`, {
    language: 'csharp',
    code
  });
}

export async function runTests(code) {
  return jsonFetch(`${API_BASE}/api/code/test`, {
    language: 'csharp',
    code
  });
}

export async function submitSolution(code) {
  return jsonFetch(`${API_BASE}/api/assessment/submit`, {
    language: 'csharp',
    code
  });
}
