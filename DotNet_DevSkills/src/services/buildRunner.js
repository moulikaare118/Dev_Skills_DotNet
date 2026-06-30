/**
 * buildRunner.js
 * Orchestrates the build and test execution workflow
 * Coordinates between project state, ZIP generation, and Judge0 submission
 */

import { createAndEncodeProjectZip } from './zipGenerator.js';
import { submitAndWaitForResults, formatResultsForConsole, parseTestResults } from './judge0Integration.js';

/**
 * Executes complete build and test workflow
 * @param {Array} files - Project files from state
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Complete build/test results
 */
export async function executeBuildAndTest(files = [], options = {}) {
  const {
    onProgress = null,
    onError = null,
    timeLimit = 10,
    memoryLimit = 512000
  } = options;

  try {
    // Step 1: Validate and prepare
    notifyProgress(onProgress, 'Validating project structure...');
    const validated = validateProjectFiles(files);

    if (!validated.isValid) {
      throw new Error(`Invalid project: ${validated.errors.join(', ')}`);
    }

    // Step 2: Create ZIP
    notifyProgress(onProgress, 'Creating project package...');
    const zipResult = await createAndEncodeProjectZip(files);

    if (!zipResult.success) {
      throw new Error(`ZIP creation failed: ${zipResult.error}`);
    }

    const zipSizeMB = (zipResult.size / 1024 / 1024).toFixed(2);
    notifyProgress(onProgress, `Project packaged (${zipSizeMB}MB). Submitting to Judge0...`);

    // Step 3: Submit to Judge0
    const submission = {
      languageId: 89,
      additionalFiles: zipResult.base64,
      compileCmd: 'bash compile.sh',
      runCmd: 'bash run.sh',
      timeLimit,
      memoryLimit
    };

    notifyProgress(onProgress, 'Waiting for compilation and test execution...');
    const results = await submitAndWaitForResults(submission);

    if (!results.success && !results.completed) {
      throw new Error(results.error || 'Judge0 submission failed');
    }

    // Step 4: Parse results
    notifyProgress(onProgress, 'Processing results...');
    const testResults = parseTestResults(results.output || '');

    return {
      success: results.success,
      results,
      tests: testResults,
      output: formatResultsForConsole(results),
      outputRaw: results.output || '',
      compileOutput: results.compileOutput || '',
      runtimeError: results.runtimeError || '',
      exitCode: results.exit_code,
      completed: true
    };
  } catch (error) {
    console.error('Build and test execution failed:', error);
    notifyProgress(onError, `Error: ${error.message}`);

    return {
      success: false,
      error: error.message,
      output: [`Error: ${error.message}`],
      completed: false
    };
  }
}

/**
 * Validates that files contain required project structure
 * @param {Array} files - Files to validate
 * @returns {Object} Validation result
 */
export function validateProjectFiles(files = []) {
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

  // Check for solution file
  const hasSln = files.some((f) => f.path?.endsWith('.sln'));
  const hasCsproj = files.some((f) => f.path?.endsWith('.csproj'));

  if (!hasSln) {
    result.warnings.push('No .sln file found');
  }

  if (!hasCsproj) {
    result.isValid = false;
    result.errors.push('No .csproj files found');
  }

  // Check for test project
  const hasTests = files.some(
    (f) => f.path?.toLowerCase().includes('test') || f.name?.toLowerCase().includes('test')
  );

  if (!hasTests) {
    result.warnings.push('No test files found');
  }

  // Check file sizes
  let totalSize = 0;
  files.forEach((file) => {
    const size = (file.content || '').length;
    totalSize += size;

    if (size > 10 * 1024 * 1024) {
      result.warnings.push(`Large file: ${file.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
    }
  });

  if (totalSize > 100 * 1024 * 1024) {
    result.isValid = false;
    result.errors.push(`Project too large (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  return result;
}

/**
 * Helper to notify progress callbacks
 * @param {Function} callback - Callback function
 * @param {string} message - Progress message
 */
function notifyProgress(callback, message) {
  if (typeof callback === 'function') {
    callback(message);
  }
  console.log(`[Build] ${message}`);
}

/**
 * Extracts test statistics from parsed test results
 * @param {Object} testResults - Parsed test results
 * @returns {Object} Test statistics
 */
export function getTestStatistics(testResults = {}) {
  return {
    total: testResults.totalTests || 0,
    passed: testResults.passedTests || 0,
    failed: testResults.failedTests || 0,
    skipped: testResults.skippedTests || 0,
    successRate: testResults.totalTests > 0 
      ? (((testResults.passedTests || 0) / testResults.totalTests) * 100).toFixed(1)
      : '0'
  };
}

/**
 * Creates a summary of build/test results for UI display
 * @param {Object} buildResults - Results from executeBuildAndTest
 * @returns {Object} Summary object
 */
export function createResultsSummary(buildResults = {}) {
  const { results, tests, success, error } = buildResults;

  if (!success || !results) {
    return {
      status: 'FAILED',
      title: 'Build/Test Failed',
      message: error || 'Unknown error',
      details: null
    };
  }

  if (results.isCompilationError) {
    return {
      status: 'COMPILE_ERROR',
      title: 'Compilation Failed',
      message: 'Your code has syntax errors',
      details: {
        output: results.compileOutput || ''
      }
    };
  }

  if (results.isRuntimeError) {
    return {
      status: 'RUNTIME_ERROR',
      title: 'Runtime Error',
      message: 'Code crashed during execution',
      details: {
        output: results.runtimeError || ''
      }
    };
  }

  if (results.isTimeoutError) {
    return {
      status: 'TIMEOUT',
      title: 'Timeout',
      message: 'Execution exceeded time limit',
      details: null
    };
  }

  if (tests && tests.totalTests > 0) {
    const stats = getTestStatistics(tests);
    const allPassed = tests.failedTests === 0;

    return {
      status: allPassed ? 'SUCCESS' : 'SOME_FAILED',
      title: allPassed ? 'All Tests Passed!' : 'Some Tests Failed',
      message: `${stats.passed}/${stats.total} tests passed`,
      details: {
        tests: tests.tests,
        statistics: stats,
        output: results.output || ''
      }
    };
  }

  return {
    status: 'SUCCESS',
    title: 'Build Successful',
    message: 'Project compiled successfully',
    details: {
      output: results.output || ''
    }
  };
}

/**
 * Formats build output for console display
 * @param {Object} buildResults - Results from executeBuildAndTest
 * @returns {Array<string>} Formatted output lines
 */
export function formatBuildOutputForConsole(buildResults = {}) {
  const lines = [];

  if (!buildResults.completed) {
    lines.push(`Error: ${buildResults.error || 'Build process failed'}`);
    return lines;
  }

  const summary = createResultsSummary(buildResults);

  // Add header
  lines.push('='.repeat(60));
  lines.push(summary.title);
  lines.push('='.repeat(60));

  // Add status and message
  lines.push(summary.message);
  lines.push('');

  // Add details
  if (summary.details) {
    if (summary.details.statistics) {
      lines.push('Test Summary:');
      const stats = summary.details.statistics;
      lines.push(`  Total:   ${stats.total}`);
      lines.push(`  Passed:  ${stats.passed}`);
      lines.push(`  Failed:  ${stats.failed}`);
      lines.push(`  Skipped: ${stats.skipped}`);
      lines.push(`  Success Rate: ${stats.successRate}%`);
      lines.push('');
    }

    if (summary.details.tests && summary.details.tests.length > 0) {
      lines.push('Test Results:');
      summary.details.tests.forEach((test) => {
        const icon = test.passed ? '✅' : '❌';
        lines.push(`  ${icon} ${test.name} (${test.duration})`);
      });
      lines.push('');
    }
  }

  // Add raw output
  if (buildResults.outputRaw) {
    lines.push('Detailed Output:');
    lines.push('---');
    buildResults.outputRaw.split('\n').forEach((line) => {
      lines.push(line);
    });
    lines.push('---');
  }

  // Add exit code if available
  if (buildResults.exitCode !== null && buildResults.exitCode !== undefined) {
    lines.push(`Exit Code: ${buildResults.exitCode}`);
  }

  lines.push('');
  lines.push('='.repeat(60));

  return lines.filter(Boolean);
}

export default {
  executeBuildAndTest,
  validateProjectFiles,
  getTestStatistics,
  createResultsSummary,
  formatBuildOutputForConsole
};
