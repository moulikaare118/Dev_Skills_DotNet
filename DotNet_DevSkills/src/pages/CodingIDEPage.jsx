import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../components/ThemeToggle';
import FileExplorer from '../components/FileExplorer';
import AssessmentDetails from '../components/AssessmentDetails';
import ConsolePanel from '../components/ConsolePanel';
import Timer from '../components/Timer';
import useIDEStore from '../store/useIDEStore';
import { buildAndRunTests, submitSolution } from '../services/api';

const problemMeta = {
  title: 'MainExam: E-Learning Platform',
  difficulty: 'Medium',
  timeLimit: '120 minutes',
  language: 'C#',
  description: 'Build an ASP.NET Core MVC e-learning platform with EF Core database layer, course management, student performance analytics, and xUnit tests.',
  inputFormat: 'Use the project structure with Models, Services, DTOs, and Controllers. Query data from the in-memory or SQLite database.',
  outputFormat: 'Return console output, test results, and HTTP responses from the MVC controllers.',
  task: 'Task 1: Implement course query and search services in HON.Academy.DAL and wire them to HON.Academy.Web.',
  solution: 'Solution files are located in HON.Academy.DAL/Services/CourseServices.cs and HON.Academy.Web/Controllers/CourseController.cs.',
  examples: 'Task 1.1: Get top 5 students by avg score per course\nTask 1.2: Search courses by fee range, duration, keyword, and instructor specialization\nTask 3.1-3.3: Implement dependency injection, controller actions, and view models',
  instructions: [
    'Implement services in HON.Academy.DAL (Tasks 1.1, 1.2)',
    'Implement controller actions in HON.Academy.Web (Tasks 3.1, 3.2, 3.3)',
    'Run unit tests via dotnet test to validate implementations',
    'Submit the final solution once all tests pass',
    'Autosave is enabled every 30 seconds',
    'Project structure includes: Models (Student, Course, Assignment, Result), Services (CourseServices), Controllers (CourseController), DTOs (StudentPerformanceDTO, CourseDTO)'
  ]
};

const DEFAULT_OUTPUT_PLACEHOLDER = 'No output returned from dotnet.';

function getEditorTheme(theme) {
  return theme === 'dark' ? 'vs-dark' : 'vs-light';
}

function formatConsoleOutput(response, mode) {
  const rawOutput = typeof response?.output === 'string' ? response.output.trim() : '';

  if (rawOutput && rawOutput !== DEFAULT_OUTPUT_PLACEHOLDER) {
    return rawOutput.split('\n');
  }

  const label = mode === 'test' ? 'Test' : 'Build';
  const successMessage = response?.success ? `${label} completed successfully.` : `${label} failed.`;

  return [
    successMessage,
    typeof response?.exitCode === 'number' ? `Exit code: ${response.exitCode}` : null,
    'dotnet produced no console output.'
  ].filter(Boolean);
}

function extractFailureDetails(output) {
  const lines = Array.isArray(output) ? output.join('\n') : output || '';
  const outputLines = lines.split('\n');
  const failures = [];

  for (let index = 0; index < outputLines.length; index += 1) {
    const line = outputLines[index].trim();
    if (!line) continue;

    const failureMatch = line.match(/\[FAIL\]|Failed|AssertionError|Assert\.|Expected|Actual/i);
    if (!failureMatch) continue;

    failures.push(line);
    const nextLine = outputLines[index + 1]?.trim();
    if (nextLine && !nextLine.match(/^(\[|\-|at\s)/i)) {
      failures.push(`  └─ ${nextLine}`);
    }
  }

  return failures;
}

function parseTestResults(output) {
  const lines = Array.isArray(output) ? output.join('\n') : output || '';
  const totalMatch = lines.match(/Total\s+tests:\s*(\d+)/i);
  const passedMatch = lines.match(/Passed:\s*(\d+)/i);
  const failedMatch = lines.match(/Failed:\s*(\d+)/i);

  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  let failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;

  if (total > 0 && passed > 0 && failed === 0) {
    failed = total - passed;
  }

  return {
    passed,
    failed,
    failures: failed > 0 ? extractFailureDetails(lines) : []
  };
}

function createSubmissionLines(success, results) {
  const summary = [
    success ? 'Submission completed successfully.' : 'Submission failed. Please fix the issues and try again.',
    `✓ Tests Passed: ${results.passed}`,
    `✗ Tests Failed: ${results.failed}`,
    `Total Tests: ${results.passed + results.failed}`
  ];

  if (success) {
    return [...summary, 'Solution access is now enabled. Click "Get Solution".'];
  }

  if (results.failures.length > 0) {
    return [...summary, '', 'Failed Assertions:', ...results.failures];
  }

  return summary;
}

export default function CodingIDEPage({ theme, onToggleTheme }) {
  const activeFileId = useIDEStore((state) => state.activeFileId);
  const files = useIDEStore((state) => state.files);
  const activeOutputTab = useIDEStore((state) => state.activeOutputTab);
  const activeRightTab = useIDEStore((state) => state.activeRightTab);
  const outputLines = useIDEStore((state) => state.outputLines);
  const testLines = useIDEStore((state) => state.testLines);
  const submissionLines = useIDEStore((state) => state.submissionLines);
  const unsavedChanges = useIDEStore((state) => state.unsavedChanges);
  const workspaceLoaded = useIDEStore((state) => state.workspaceLoaded);
  const workspaceLoading = useIDEStore((state) => state.workspaceLoading);
  const workspaceError = useIDEStore((state) => state.workspaceError);
  const workspaceMode = useIDEStore((state) => state.workspaceMode);
  const testResults = useIDEStore((state) => state.testSummary);
  const fullscreen = useIDEStore((state) => state.fullscreen);
  const [timeExpired, setTimeExpired] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timerResetSignal, setTimerResetSignal] = useState(0);
  const workspaceSyncStarted = useRef(false);
  const setActiveFile = useIDEStore((state) => state.setActiveFile);
  const updateFileContent = useIDEStore((state) => state.updateFileContent);
  const setActiveOutputTab = useIDEStore((state) => state.setActiveOutputTab);
  const setActiveRightTab = useIDEStore((state) => state.setActiveRightTab);
  const setOutputLines = useIDEStore((state) => state.setOutputLines);
  const setTestLines = useIDEStore((state) => state.setTestLines);
  const setTestSummary = useIDEStore((state) => state.setTestSummary);
  const setSubmissionLines = useIDEStore((state) => state.setSubmissionLines);
  const saveChanges = useIDEStore((state) => state.saveChanges);
  const resetEditor = useIDEStore((state) => state.resetEditor);
  const refreshFiles = useIDEStore((state) => state.refreshFiles);
  const loadWorkspace = useIDEStore((state) => state.loadWorkspace);
  const toggleFullscreen = useIDEStore((state) => state.toggleFullscreen);

  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId), [files, activeFileId]);
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  const formatConsoleOutput = useCallback((response, mode) => {
    const rawOutput = typeof response?.output === 'string' ? response.output.trim() : '';
    const placeholderOutput = 'No output returned from dotnet.';

    if (rawOutput && rawOutput !== placeholderOutput) {
      return rawOutput.split('\n');
    }

    const label = mode === 'test' ? 'Test' : 'Build';
    const successMessage = response?.success
      ? `${label} completed successfully.`
      : `${label} failed.`;

    const summary = [
      successMessage,
      typeof response?.exitCode === 'number' ? `Exit code: ${response.exitCode}` : null,
      'dotnet produced no console output.'
    ].filter(Boolean);

    return summary;
  }, []);

  useEffect(() => {
    if (!workspaceSyncStarted.current) {
      workspaceSyncStarted.current = true;
      loadWorkspace('starter');
    }
  }, [loadWorkspace]);

  const handleBuildAndRunTests = useCallback(async () => {
    setActiveOutputTab('output');
    setOutputLines(['Building project and running tests...']);
    setTestLines(['Building project and running tests...']);
    setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });

    try {
      const response = await buildAndRunTests(files);
      const buildResult = response?.buildResult || response;
      const testResult = response?.testResult || null;

      setOutputLines(formatConsoleOutput(buildResult, 'build'));

      if (testResult) {
        setTestLines(formatConsoleOutput(testResult, 'test'));
        const parsedResults = parseTestResults(testResult.output || response?.output || '');
        setTestSummary({
          total: parsedResults.passed + parsedResults.failed,
          passed: parsedResults.passed,
          failed: parsedResults.failed,
          skipped: 0,
          duration: null
        });
      } else {
        setTestLines(['Tests were not run because the build failed.']);
        setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });
      }
    } catch (error) {
      setOutputLines([`Error: ${error.message || error}`]);
      setTestLines(['Build and test execution failed.']);
      setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });
    }
  }, [files, formatConsoleOutput, setActiveOutputTab, setOutputLines, setTestLines, setTestSummary]);

  const handleSubmit = useCallback(async () => {
    setActiveOutputTab('submission');
    setSubmissionLines(['Submitting final solution...']);
    setSubmitted(true);

    try {
      const response = await submitSolution(files);
      setSubmissionLines([
        `Status: ${response.status || 'Submitted'}`,
        `Passed: ${response.passed || 0}`,
        `Failed: ${response.failed || 0}`,
        `Message: ${response.message || 'Solution submitted successfully.'}`
      ]);

      if (response.success) {
        setSolutionUnlocked(true);
      }
    } catch (error) {
      setSubmissionLines([`Error: ${error.message || error}`]);
    }
  }, [files, setActiveOutputTab, setSubmissionLines]);

  const handleGetSolution = useCallback(async () => {
    if (!timeExpired && !solutionUnlocked && !submitted) return;

    setActiveOutputTab('submission');
    setSubmissionLines(['Loading solution workspace...']);

    try {
      await loadWorkspace('solution');
      setSubmissionLines(['Solution workspace loaded successfully.']);
      setOutputLines(['Ready to build and run tests against the solution workspace.']);
      setTestLines(['Test runner is ready.']);
    } catch (error) {
      setSubmissionLines([`Error: ${error.message || 'Unable to load solution workspace'}`]);
    }
  }, [loadWorkspace, setActiveOutputTab, setSubmissionLines, solutionUnlocked, submitted, timeExpired]);

  const handleAction = useCallback(async (action) => {
    if (action === 'hints') {
      setSubmissionLines(['Hint: focus on MVC controllers, EF Core configuration, and clean validation.']);
      return;
    }

    if (action === 'finish') {
      handleFinishTest();
      return;
    }

    if (action === 'reset') {
      if (submitted) {
        return;
      }

      setActiveOutputTab('output');
      setActiveRightTab('problem');
      setOutputLines(['Resetting editor to live workspace...']);
      setSubmissionLines([]);
      setTestLines(['Test runner is ready.']);
      setSubmitting(false);
      setTestFinished(false);
      setTimeExpired(false);
      setSolutionUnlocked(false);
      setTimerResetSignal((value) => value + 1);
      window.localStorage.removeItem('devskills-assessment-timer');

      setSubmitted(false);

      // Reload starter workspace and reset IDE state
      await resetEditor();

      setActiveOutputTab('output');
      setActiveRightTab('problem');
      setOutputLines(['Ready to run your code.']);
      setSubmissionLines([]);
      setTestLines(['Test runner is ready.']);
      setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });
      setTestCases([]);
      setSubmitted(false);
      setTestFinished(false);
      setSubmitting(false);
    }
  }, [resetEditor, setActiveOutputTab, setActiveRightTab, setSubmissionLines, setOutputLines, setTestLines, submitted]);

  useEffect(() => {
    const saveInterval = window.setInterval(() => {
      if (unsavedChanges) {
        saveChanges();
      }
    }, 30000);

    return () => window.clearInterval(saveInterval);
  }, [unsavedChanges, saveChanges]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveChanges();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleBuildAndRunTests();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleBuildAndRunTests, saveChanges]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-[#84BD00] px-4 py-2 text-sm font-semibold text-slate-950">MainExam</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">E-Learning Assessment IDE</p>
              <p className="text-xs text-slate-500">.NET Core / C# | Course Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time Remaining</p>
              <Timer active={!timeExpired && !submitted} onExpire={() => setTimeExpired(true)} resetSignal={timerResetSignal} />
            </div>
            {/* <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">Candidate: Alex</div> */}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-160px)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="flex min-w-0 flex-col gap-5">
            <div className="w-full max-w-[280px]">
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFile}
                onSave={saveChanges}
                onRefresh={refreshFiles}
              />
            </div>
            {/* <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{workspaceLoading ? 'Loading workspace...' : unsavedChanges ? 'Unsaved changes' : workspaceLoaded ? 'Saved' : 'Workspace unavailable'}</p>
                  {workspaceError ? <p className="mt-2 text-sm text-rose-600">{workspaceError}</p> : null}
                </div>
                <button onClick={toggleFullscreen} className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
              </div>
            </div> */}
          </aside>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-shrink-0">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Editor</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">Coding Workspace</h2>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {workspaceMode === 'solution' ? 'Solution Workspace' : 'Starter Workspace'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleBuildAndRunTests} className="inline-flex items-center gap-2 rounded-3xl bg-[#84BD00] px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-500">Build & Run Tests</button>
                  <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400">Submit</button>
                  <button onClick={handleGetSolution} disabled={!timeExpired && !solutionUnlocked && !submitted} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 hover:bg-slate-700">Get Solution</button>
                  <button onClick={resetEditor} disabled={submitted} className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Reset</button>
                </div>
              </div>
              <div className="h-[calc(100vh-340px)] overflow-hidden rounded-3xl bg-slate-950">
                {workspaceLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-300">Loading workspace from backend...</div>
                ) : (
                  <Editor
                    key={activeFile?.id || 'editor'}
                    height="100%"
                    defaultLanguage="csharp"
                    value={activeFile?.content || ''}
                    theme={editorTheme}
                    options={{
                      readOnly: activeFile?.readOnly ?? false,
                      fontSize: 14,
                      minimap: { enabled: true },
                      automaticLayout: true,
                      folding: true,
                      bracketPairColorization: { enabled: true },
                      renderWhitespace: 'boundary',
                      suggestOnTriggerCharacters: true,
                      wordWrap: 'on',
                      tabSize: 4,
                      fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Liberation Mono, monospace'
                    }}
                    onChange={(value) => {
                      if (value !== undefined && activeFile) {
                        updateFileContent(activeFile.id, value);
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
              <ConsolePanel
                activeTab={activeOutputTab}
                outputLines={outputLines}
                testLines={testLines}
                submissionLines={submissionLines}
                setActiveTab={setActiveOutputTab}
                testResults={testResults}
              />
              <div className="grid gap-5">
                <AssessmentDetails activeTab={activeRightTab} onChangeTab={setActiveRightTab} problemMeta={problemMeta} onAction={handleAction} submitted={submitted} />
                {/* <KeyboardShortcuts /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
