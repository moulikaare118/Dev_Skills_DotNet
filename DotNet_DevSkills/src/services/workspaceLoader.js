import assessmentMeta from '../data/assessmentMeta.json';
import { assessmentWorkspaceFiles } from '../data/fallbackWorkspace';

function getAssessmentConfig(assessmentKey = 'main-exam') {
  return assessmentMeta?.codeEditor?.assessments?.find(
    (assessment) => String(assessment.key || '').trim().toLowerCase() === String(assessmentKey || '').trim().toLowerCase()
  ) || null;
}

function getPublicRoot(assessmentKey = 'main-exam', mode = 'starter') {
  const assessmentConfig = getAssessmentConfig(assessmentKey);
  const rootPath = mode === 'solution' ? assessmentConfig?.solutionRoot : assessmentConfig?.starterRoot;
  const normalizedRoot = (rootPath || (assessmentKey === 'hon-orders' ? 'public/testToday-main' : 'public/MainCode'))
    .replace(/^public\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  return normalizedRoot;
}

async function readPublicFile(assessmentKey, mode, relativePath) {
  const publicRoot = getPublicRoot(assessmentKey, mode);
  const normalizedRelativePath = String(relativePath || '').replace(/^\/+/, '').replace(/\\/g, '/');
  const url = `/${publicRoot}/${normalizedRelativePath}`;
  const response = await fetch(encodeURI(url));

  if (!response.ok) {
    throw new Error(`Unable to load ${url} (${response.status})`);
  }

  return response.text();
}

export async function loadWorkspaceFiles(assessmentKey = 'main-exam', mode = 'starter') {
  try {
    const workspaceFiles = assessmentWorkspaceFiles[assessmentKey] || assessmentWorkspaceFiles['main-exam'] || [];
    const files = await Promise.all(
      workspaceFiles.map(async (file, index) => {
        const content = await readPublicFile(assessmentKey, mode, file.path).catch(() => file.content || '');

        return {
          ...file,
          id: file.id || `${file.name || 'workspace'}-${index}`,
          readOnly: file.readOnly ?? false,
          content: content || file.content || ''
        };
      })
    );

    return files.length > 0 ? files : workspaceFiles.map((file) => ({ ...file, readOnly: file.readOnly ?? false }));
  } catch (error) {
    console.error('Workspace loading failed:', error);
    return (assessmentWorkspaceFiles[assessmentKey] || assessmentWorkspaceFiles['main-exam'] || []).map((file) => ({ ...file, readOnly: file.readOnly ?? false }));
  }
}
