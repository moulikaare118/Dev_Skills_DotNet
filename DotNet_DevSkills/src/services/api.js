const APP_BASE = new URL('./', window.location.href).href;

async function fetchJson(path) {
  const response = await fetch(new URL(path, APP_BASE).href);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch JSON');
  }
  return response.json();
}

export async function loadAssessmentMeta() {
  return fetchJson('assessment-data.json');
}

export async function loadAssessmentMetaFallback() {
  return loadAssessmentMeta();
}
