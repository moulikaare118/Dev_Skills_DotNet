import assessmentMeta from '../data/assessmentMeta.json';

function normalizeAssessmentKey(assessmentKey = 'main-exam') {
  return String(assessmentKey || '').trim().toLowerCase();
}

function getAssessmentConfig(assessmentKey = 'main-exam') {
  return assessmentMeta?.codeEditor?.assessments?.find(
    (assessment) => normalizeAssessmentKey(assessment.key) === normalizeAssessmentKey(assessmentKey)
  ) || null;
}

function getPublicBase() {
  const base = import.meta.env?.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function normalizeAssetRoot(rootPath = '') {
  return String(rootPath || '')
    .replace(/^public\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function getQuestionManifest() {
  return fetch(`${getPublicBase()}questions/questions.json`).then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load question manifest (${response.status})`);
    }

    return response.json();
  });
}

async function readPublicFile(assetRoot, relativePath) {
  const normalizedRelativePath = String(relativePath || '').replace(/^\/+/, '').replace(/\\/g, '/');
  const normalizedRoot = normalizeAssetRoot(assetRoot);
  const url = `${getPublicBase()}${normalizedRoot}/${normalizedRelativePath}`;
  const response = await fetch(encodeURI(url));

  if (!response.ok) {
    throw new Error(`Unable to load ${url} (${response.status})`);
  }

  return response.text();
}

async function loadQuestionFiles(assessmentKey, mode) {
  const config = getAssessmentConfig(assessmentKey);
  const questionManifest = await getQuestionManifest().catch(() => null);
  const question = Array.isArray(questionManifest?.questions)
    ? questionManifest.questions.find((entry) => normalizeAssessmentKey(entry.key) === normalizeAssessmentKey(assessmentKey)) || null
    : null;

  const requestedFiles = mode === 'solution'
    ? question?.solutionFiles || []
    : question?.starterFiles || [];

  const assetRoot = mode === 'solution'
    ? question?.solutionRoot || config?.solutionRoot || null
    : question?.starterRoot || config?.starterRoot || null;

  if (!assetRoot) {
    throw new Error(`No project assets found for ${assessmentKey}`);
  }

  if (requestedFiles.length === 0) {
    throw new Error(`No files are registered for ${assessmentKey}`);
  }

  return Promise.all(
    requestedFiles.map(async (relativePath, index) => {
      const content = await readPublicFile(assetRoot, relativePath).catch(() => '');
      const name = String(relativePath || '').split('/').pop() || `file-${index}`;
      const normalizedPath = String(relativePath || '').replace(/^\/+/, '').replace(/\\/g, '/');

      return {
        id: `${assessmentKey}-${index}-${name}`,
        name,
        path: normalizedPath,
        readOnly: false,
        content: content || ''
      };
    })
  );
}

export async function loadWorkspaceFiles(assessmentKey = 'main-exam', mode = 'starter') {
  try {
    return await loadQuestionFiles(assessmentKey, mode);
  } catch (error) {
    console.warn('Dynamic question loading failed, falling back to legacy workspace assets:', error);

    const config = getAssessmentConfig(assessmentKey);
    const fallbackRoot = mode === 'solution' ? config?.solutionRoot : config?.starterRoot;
    const fallbackPath = normalizeAssetRoot(fallbackRoot || (normalizeAssessmentKey(assessmentKey) === 'hon-orders' ? 'testToday-main' : 'MainCode'));

    return [
      {
        id: `${assessmentKey}-fallback-entry`,
        name: 'README.md',
        path: 'README.md',
        readOnly: false,
        content: `Static workspace assets could not be loaded from ${fallbackPath}.`
      }
    ];
  }
}
