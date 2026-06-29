import assessmentMeta from '../data/assessmentMeta.json';

const judge0ApiUrl = import.meta.env?.VITE_JUDGE0_API_URL || 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

function createJudge0Headers() {
  return {
    'Content-Type': 'application/json'
  };
}

function validateJudge0Config() {
  if (!judge0ApiUrl) {
    throw new Error('Judge0 API URL is not configured.');
  }
}

export async function loadAssessmentMeta() {
  return assessmentMeta;
}

export async function loadAssessmentMetaFallback() {
  return assessmentMeta;
}

export async function runCodeWithJudge0({ sourceCode, languageId = 51, stdin = '' }) {
  validateJudge0Config();

  try {
    const response = await fetch(judge0ApiUrl, {
      method: 'POST',
      headers: createJudge0Headers(),
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
    const output = [payload.stdout, payload.stderr, payload.compile_output].filter(Boolean).join('\n').trim();
    const success = payload.status?.id === 3;

    return {
      success,
      output: output || payload.status?.description || 'No output returned from Judge0.',
      exitCode: payload.exit_code ?? null,
      status: payload.status?.description || 'Unknown',
      testSummary: {
        total: success ? 1 : 0,
        passed: success ? 1 : 0,
        failed: success ? 0 : 1,
        skipped: 0,
        duration: null
      }
    };
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
