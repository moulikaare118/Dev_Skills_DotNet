import assessmentMeta from '../data/assessmentMeta.json' with { type: 'json' };
import { parseTestSummary } from './dotnetTestSummary.js';

async function loadQuestionManifest() {
  const response = await fetch('/questions/questions.json');
  if (!response.ok) {
    throw new Error(`Unable to load question manifest (${response.status})`);
  }

  return response.json();
}

function mergeAssessmentMeta(meta, manifest) {
  const assessments = Array.isArray(manifest?.questions)
    ? manifest.questions.map((question) => ({
        key: question.key,
        label: question.label,
        starterRoot: question.starterRoot,
        solutionRoot: question.solutionRoot,
        solutionFile: question.solutionFile
      }))
    : [];

  return {
    ...meta,
    codeEditor: {
      ...(meta?.codeEditor || {}),
      assessments: assessments.length > 0 ? assessments : meta?.codeEditor?.assessments || []
    }
  };
}

const judge0ApiUrl = import.meta.env?.VITE_JUDGE0_API_URL || 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';
const dotnetApiUrl = import.meta.env?.VITE_DOTNET_API_URL || '/api/run-dotnet';

function createJsonHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function validateJudge0Config() {
  if (!judge0ApiUrl) {
    throw new Error('Judge0 API URL is not configured.');
  }
}

function validateDotnetConfig() {
  if (!dotnetApiUrl) {
    throw new Error('Dotnet API URL is not configured.');
  }
}

export function normalizeJudge0Payload(payload = {}, fallbackMessage = 'No output returned from Judge0.') {
  const output = [payload.stdout, payload.stderr, payload.compile_output].filter(Boolean).join('\n').trim();
  const success = payload.status?.id === 3;

  return {
    success,
    output: output || payload.status?.description || fallbackMessage,
    exitCode: payload.exit_code ?? null,
    status: payload.status?.description || 'Unknown',
    testSummary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: null
    }
  };
}

export async function loadAssessmentMeta() {
  try {
    const manifest = await loadQuestionManifest();
    return mergeAssessmentMeta(assessmentMeta, manifest);
  } catch (error) {
    console.warn('Dynamic question manifest unavailable, using fallback metadata.', error);
    return assessmentMeta;
  }
}

export async function loadAssessmentMetaFallback() {
  return assessmentMeta;
}

export async function runCodeWithJudge0({ sourceCode, languageId = 51, stdin = '' }) {
  validateJudge0Config();

  try {
    const response = await fetch(judge0ApiUrl, {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify({
        source_code: sourceCode || '',
        language_id: languageId,
        stdin: stdin || '',
        cpu_time_limit: 2,
        memory_limit: 512000,
        wall_time_limit: 5,
        redirect_stderr_to_stdout: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    return normalizeJudge0Payload(payload);
  } catch (error) {
    console.error('Judge0 execution failed:', error);
    return {
      success: false,
      output: `Judge0 execution is unavailable right now. ${error?.message || 'Please try again later.'}`,
      exitCode: null,
      status: 'Unavailable',
      testSummary: {
        total: 0,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: null
      }
    };
  }
}

export async function runDotnetTest({ assessmentKey = 'main-exam', mode = 'starter', files = [] }) {
  validateDotnetConfig();

  try {
    const response = await fetch(dotnetApiUrl, {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify({
        assessmentKey,
        mode,
        overrides: files
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dotnet API request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    const summary = payload.testSummary || parseTestSummary(payload.output || '');

    return {
      success: Boolean(payload.success),
      output: payload.output || payload.status || 'No output returned from dotnet runner.',
      exitCode: payload.exitCode ?? null,
      status: payload.status || 'Unknown',
      testSummary: summary
    };
  } catch (error) {
    console.error('Dotnet execution failed:', error);
    return {
      success: false,
      output: `Dotnet execution is unavailable right now. ${error?.message || 'Please try again later.'}`,
      exitCode: null,
      status: 'Unavailable',
      testSummary: {
        total: 0,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: null
      }
    };
  }
}
