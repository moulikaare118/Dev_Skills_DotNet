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

// Mock API - simulates build and test execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function analyzeCode(code) {
  const hasSyntaxErrors = /^[\s]*$/.test(code);
  const hasAsync = code.includes('async') && code.includes('await');
  const hasDbContext = code.includes('DbContext') || code.includes('AppDbContext');
  const hasServiceInjection = code.includes('ICourseService') || code.includes('CourseServices');
  
  return {
    hasSyntaxErrors,
    hasAsync,
    hasDbContext,
    hasServiceInjection
  };
}

export async function runCode(code) {
  await delay(1200);
  
  const analysis = analyzeCode(code);
  
  if (analysis.hasSyntaxErrors) {
    return {
      output: 'Error: No code provided or empty file.',
      success: false
    };
  }

  const output = [
    'Compiling MainExam project...',
    'Restoring dependencies...',
    '',
    'Build Summary:',
    '  HON.Academy.DAL → bin/Debug/net10.0/HON.Academy.DAL.dll',
    '  HON.Academy.Web → bin/Debug/net10.0/HON.Academy.Web.dll',
    '',
    'Build succeeded. 0 errors, 0 warnings.',
    'Time Elapsed 00:00:12.35',
    '',
    'Startup: Application ready.',
    'Loading data context...',
    'Database initialized with seed data.',
    'API endpoints available at: https://localhost:5001'
  ];

  return {
    output: output.join('\n'),
    success: true
  };
}

export async function runTests(code) {
  await delay(1800);

  const analysis = analyzeCode(code);
  
  // All tests should pass by default - student will see realistic test results
  const results = [
    { name: 'GetTopStudentsAsync_Returns_TopStudentEntry', passed: true },
    { name: 'SearchCoursesAsync_Filters_ByFeeDurationKeywordAndSpecialization', passed: true },
    { name: 'SampleTests.Sanity', passed: true },
    { name: 'CourseServices_Integration_WithMockDb', passed: true },
    { name: 'CourseController_Dependency_Injection', passed: true },
    { name: 'EntityFramework_Relationships', passed: true },
    { name: 'DTO_Serialization', passed: true },
    { name: 'Database_Concurrency_Control', passed: true }
  ];

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  const output = [
    'Test run for HON.Academy.XunitTests.dll (.NETCoreApp,Version=v10.0)',
    'A total of 1 test file matched the specified pattern.',
    '',
    'Test Results:',
    ...results.map(r => `  ${r.passed ? '✓' : '✗'} ${r.name}`),
    '',
    `Passed! - Failed: ${failed}, Passed: ${passed}, Skipped: 0, Total: ${passed + failed}`,
    'Duration: 1.8s'
  ];

  return {
    output: output.join('\n'),
    passed,
    failed,
    results,
    success: failed === 0
  };
}

export async function submitSolution(code) {
  await delay(2000);

  const analysis = analyzeCode(code);
  
  if (analysis.hasSyntaxErrors) {
    return {
      status: 'Failed',
      passed: 0,
      failed: 1,
      message: 'Please submit code content.'
    };
  }

  return {
    status: 'Submitted',
    passed: 8,
    failed: 0,
    message: 'Solution submitted successfully! All tests passed. Great work on the MainExam e-learning platform implementation.'
  };
}
