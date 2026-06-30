/**
 * judge0Integration.js
 * Integrates with Judge0 API for multi-file .NET project execution
 * Language ID 89: Multi-file Program mode
 */

const JUDGE0_API_URL = import.meta.env?.VITE_JUDGE0_API_URL || 'https://ce.judge0.com';

/**
 * Default Judge0 configuration for .NET projects
 */
const DEFAULT_JUDGE0_CONFIG = {
  language_id: 89, // Multi-file Program
  cpu_time_limit: 10,
  memory_limit: 512000,
  wall_time_limit: 15,
  redirect_stderr_to_stdout: true
};

/**
 * Validates Judge0 API configuration
 */
function validateJudge0Config() {
  if (!JUDGE0_API_URL) {
    throw new Error('Judge0 API URL not configured. Set VITE_JUDGE0_API_URL environment variable.');
  }
}

/**
 * Creates HTTP headers for Judge0 requests
 */
function createHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

/**
 * Submits a multi-file project to Judge0
 * @param {Object} submission - Submission data
 *   {
 *     languageId: 89,
 *     additionalFiles: "base64_encoded_zip",
 *     compileCmd: "bash compile.sh",
 *     runCmd: "bash run.sh"
 *   }
 * @returns {Promise<Object>} Submission token and metadata
 */
export async function submitProjectToJudge0(submission = {}) {
  validateJudge0Config();

  const {
    languageId = 89,
    additionalFiles = '',
    compileCmd = 'bash compile.sh',
    runCmd = 'bash run.sh',
    timeLimit = DEFAULT_JUDGE0_CONFIG.cpu_time_limit,
    memoryLimit = DEFAULT_JUDGE0_CONFIG.memory_limit
  } = submission;

  try {
    if (!additionalFiles) {
      throw new Error('additionalFiles (Base64 ZIP) is required');
    }

    const payload = {
      language_id: languageId,
      additional_files: additionalFiles,
      compile_cmd: compileCmd,
      run_cmd: runCmd,
      cpu_time_limit: timeLimit,
      memory_limit: memoryLimit,
      wall_time_limit: timeLimit + 5,
      redirect_stderr_to_stdout: true
    };

    const url = `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`;

    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 submission failed (${response.status}): ${error}`);
    }

    const result = await response.json();

    return {
      token: result.token,
      submissionId: result.token,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      success: true
    };
  } catch (error) {
    console.error('Judge0 submission failed:', error);
    return {
      token: null,
      status: 'FAILED',
      error: error.message,
      success: false
    };
  }
}

/**
 * Polls Judge0 for submission results
 * @param {string} token - Submission token
 * @param {Object} options - Polling options { maxAttempts, delayMs }
 * @returns {Promise<Object>} Submission results
 */
export async function pollJudge0Results(token, options = {}) {
  validateJudge0Config();

  const { maxAttempts = 60, delayMs = 1000 } = options;

  if (!token) {
    throw new Error('Submission token is required');
  }

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const url = `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`;

      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`Judge0 poll failed (${response.status})`);
      }

      const result = await response.json();
      const status = result.status?.id;

      // Status codes:
      // 1 = In Queue
      // 2 = Processing
      // 3 = Accepted (Correct answer)
      // 4 = Wrong Answer
      // 5 = Time Limit Exceeded
      // 6 = Compilation Error
      // 7 = Runtime Error (SIGSEGV)
      // 8 = Runtime Error (SIGXFSZ)
      // 9 = Runtime Error (SIGFPE)
      // 10 = Runtime Error (SIGABRT)
      // 11 = Runtime Error (NZEC)
      // 12 = Runtime Error (Other)
      // 13 = Internal Error
      // 14 = Exec Format Error

      if (status === 1 || status === 2) {
        // Still processing, wait and retry
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // Result is ready
      return {
        token,
        status: result.status?.description || 'Unknown',
        statusId: status,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compile_output: result.compile_output || '',
        exit_code: result.exit_code,
        cpu_time: result.cpu_time,
        memory: result.memory,
        output: decodeBase64(result.stdout || '') || '',
        compileOutput: decodeBase64(result.compile_output || '') || '',
        runtimeError: decodeBase64(result.stderr || '') || '',
        success: status === 3 || status === 4, // Accepted or Wrong Answer (code ran)
        isCompilationError: status === 6,
        isRuntimeError: [7, 8, 9, 10, 11, 12, 13, 14].includes(status),
        isTimeoutError: status === 5
      };
    } catch (error) {
      console.error('Judge0 poll error:', error);
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error(`Judge0 polling timed out after ${maxAttempts} attempts: ${error.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Judge0 submission polling timeout');
}

/**
 * Submits project and waits for results
 * @param {Object} submission - Submission data
 * @param {Object} options - Polling options
 * @returns {Promise<Object>} Complete submission with results
 */
export async function submitAndWaitForResults(submission = {}, options = {}) {
  try {
    // Submit
    const submitResult = await submitProjectToJudge0(submission);

    if (!submitResult.success || !submitResult.token) {
      return submitResult;
    }

    // Poll for results
    const pollResult = await pollJudge0Results(submitResult.token, options);

    return {
      ...submitResult,
      ...pollResult,
      completed: true
    };
  } catch (error) {
    console.error('Submit and wait failed:', error);
    return {
      success: false,
      error: error.message,
      completed: false
    };
  }
}

/**
 * Decodes Base64 string (for stdout/stderr from Judge0)
 * @param {string} base64String - Base64 encoded string
 * @returns {string} Decoded string
 */
function decodeBase64(base64String = '') {
  try {
    if (!base64String) return '';
    return atob(base64String);
  } catch (error) {
    console.error('Base64 decode failed:', error);
    return base64String;
  }
}

/**
 * Parses test results from .NET test output
 * @param {string} output - Console output from dotnet test
 * @returns {Object} Parsed test results
 */
export function parseTestResults(output = '') {
  const lines = output.split('\n');
  const tests = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  // Parse xUnit test output format
  // Example: "MyTests.TestMethod PASSED (123ms)"
  const testPattern = /^[\s]*(.+?)\s+(PASSED|FAILED|SKIPPED)(?:\s+\((.+?)\))?/m;

  lines.forEach((line) => {
    const match = line.match(testPattern);
    if (match) {
      const [, testName, status, duration] = match;
      totalTests++;

      const test = {
        name: testName.trim(),
        status: status.toUpperCase(),
        duration: duration || 'N/A',
        passed: status.toUpperCase() === 'PASSED'
      };

      tests.push(test);

      if (status.toUpperCase() === 'PASSED') passedTests++;
      else if (status.toUpperCase() === 'FAILED') failedTests++;
      else if (status.toUpperCase() === 'SKIPPED') skippedTests++;
    }
  });

  return {
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    tests,
    allPassed: failedTests === 0 && totalTests > 0
  };
}

/**
 * Formats submission results for display in console
 * @param {Object} results - Judge0 submission results
 * @returns {Array} Array of formatted output lines
 */
export function formatResultsForConsole(results = {}) {
  const lines = [];

  if (results.error) {
    lines.push(`❌ Error: ${results.error}`);
    if (/dotnet SDK|includes the \.NET SDK|command not found/i.test(results.error)) {
      lines.push('');
      lines.push('Hint: this build requires a Judge0/runtime image that includes the .NET SDK.');
      lines.push('Use a .NET-capable container or switch to a different execution backend.');
    }
    return lines;
  }

  if (results.isCompilationError) {
    lines.push('❌ Compilation Error');
    if (results.compileOutput) {
      lines.push('---');
      lines.push(results.compileOutput);
      lines.push('---');
    }
    if (/dotnet SDK|includes the \.NET SDK|command not found/i.test(results.compileOutput || '')) {
      lines.push('Hint: this runtime does not expose the dotnet CLI.');
      lines.push('A .NET-capable Judge0 image is required for restore/build/test execution.');
    }
    return lines;
  }

  if (results.isRuntimeError) {
    lines.push('❌ Runtime Error');
    if (results.runtimeError) {
      lines.push('---');
      lines.push(results.runtimeError);
      lines.push('---');
    }
    return lines;
  }

  if (results.isTimeoutError) {
    lines.push('⏱️  Time Limit Exceeded');
    return lines;
  }

  if (results.output) {
    const testResults = parseTestResults(results.output);

    if (/dotnet SDK|includes the \.NET SDK|command not found/i.test(results.output)) {
      lines.push('Hint: the Judge0 environment is missing the dotnet CLI.');
      lines.push('A container with the .NET SDK is required for this project to compile.');
    }

    if (testResults.totalTests > 0) {
      lines.push('✅ Tests Executed');
      lines.push(`Total: ${testResults.totalTests}`);
      lines.push(`Passed: ${testResults.passedTests}`);
      lines.push(`Failed: ${testResults.failedTests}`);
      lines.push(`Skipped: ${testResults.skippedTests}`);

      if (testResults.failedTests > 0) {
        lines.push('---');
        lines.push('Failed Tests:');
        testResults.tests
          .filter((t) => !t.passed)
          .forEach((test) => {
            lines.push(`  ❌ ${test.name}`);
          });
      }

      lines.push('---');
      lines.push(results.output);
    } else {
      lines.push(results.output);
    }
  }

  if (results.exit_code !== null && results.exit_code !== undefined) {
    lines.push(`Exit Code: ${results.exit_code}`);
  }

  return lines.filter(Boolean);
}

/**
 * Creates a formatted error message for common Judge0 failures
 * @param {Object} results - Judge0 results
 * @returns {string} User-friendly error message
 */
export function createErrorMessage(results = {}) {
  if (results.isCompilationError) {
    return 'The project failed to compile. Check your C# syntax.';
  }

  if (results.isRuntimeError) {
    return 'A runtime error occurred during execution.';
  }

  if (results.isTimeoutError) {
    return 'The execution exceeded the time limit (10 seconds).';
  }

  if (results.error) {
    return results.error;
  }

  return 'An unknown error occurred.';
}

export default {
  submitProjectToJudge0,
  pollJudge0Results,
  submitAndWaitForResults,
  parseTestResults,
  formatResultsForConsole,
  createErrorMessage
};
