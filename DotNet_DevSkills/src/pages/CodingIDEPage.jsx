import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../components/ThemeToggle';
import FileExplorer from '../components/FileExplorer';
import AssessmentDetails from '../components/AssessmentDetails';
import ConsolePanel from '../components/ConsolePanel';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import Timer from '../components/Timer';
import useIDEStore from '../store/useIDEStore';
import { runCode, runTests, buildAndRunTests, submitSolution } from '../services/api';

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
  const {
    activeFileId,
    files,
    activeOutputTab,
    activeRightTab,
    outputLines,
    testLines,
    submissionLines,
    unsavedChanges,
    workspaceLoaded,
    workspaceLoading,
    workspaceError,
    fullscreen,
    setActiveFile,
    updateFileContent,
    setActiveOutputTab,
    setActiveRightTab,
    setOutputLines,
    setTestLines,
    setSubmissionLines,
    saveChanges,
    resetEditor,
    refreshFiles,
    loadWorkspace,
    toggleFullscreen
  } = useIDEStore((state) => ({
    activeFileId: state.activeFileId,
    files: state.files,
    activeOutputTab: state.activeOutputTab,
    activeRightTab: state.activeRightTab,
    outputLines: state.outputLines,
    testLines: state.testLines,
    submissionLines: state.submissionLines,
    unsavedChanges: state.unsavedChanges,
    workspaceLoaded: state.workspaceLoaded,
    workspaceLoading: state.workspaceLoading,
    workspaceError: state.workspaceError,
    fullscreen: state.fullscreen,
    setActiveFile: state.setActiveFile,
    updateFileContent: state.updateFileContent,
    setActiveOutputTab: state.setActiveOutputTab,
    setActiveRightTab: state.setActiveRightTab,
    setOutputLines: state.setOutputLines,
    setTestLines: state.setTestLines,
    setSubmissionLines: state.setSubmissionLines,
    saveChanges: state.saveChanges,
    resetEditor: state.resetEditor,
    refreshFiles: state.refreshFiles,
    loadWorkspace: state.loadWorkspace,
    toggleFullscreen: state.toggleFullscreen
  }));
  const [timeExpired, setTimeExpired] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const [testResults, setTestResults] = useState({ passed: 0, failed: 0 });
  const workspaceSyncStarted = useRef(false);

  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId), [files, activeFileId]);
  const editorTheme = getEditorTheme(theme);

  useEffect(() => {
    if (!workspaceSyncStarted.current) {
      workspaceSyncStarted.current = true;
      loadWorkspace();
    }
  }, [loadWorkspace]);

  const handleBuildAndTest = useCallback(async () => {
    setActiveOutputTab('tests');
    setTestLines(['Building and running tests...']);
    setOutputLines(['Executing build and test workflow...']);

    try {
      const response = await buildAndRunTests(files);
      const buildOutput = response.buildResult?.output ?? formatConsoleOutput(response, 'build');
      const buildSuccess = response.buildResult?.success ?? response.success;

      setOutputLines(typeof buildOutput === 'string' ? buildOutput.split('\n') : buildOutput);
      if (!buildSuccess && !response.testResult) {
        setTestLines(['Build failed. Skipping tests.']);
        return;
      }

      const testOutput = response.testResult?.output ?? formatConsoleOutput(response, 'test');
      setTestLines(typeof testOutput === 'string' ? testOutput.split('\n') : testOutput);
      setTestResults(parseTestResults(response.testResult?.output ?? response.output));
    } catch (error) {
      setTestLines([`Error: ${error.message || error}`]);
    }
  }, [files, formatConsoleOutput, parseTestResults, setActiveOutputTab, setOutputLines, setTestLines]);

  const handleTest = useCallback(async () => {
    setActiveOutputTab('tests');
    setTestLines(['Running tests...']);

    try {
      const response = await runTests(files);
      setTestLines(formatConsoleOutput(response, 'test'));
      setTestResults(parseTestResults(response.output));
    } catch (error) {
      setTestLines([`Error: ${error.message || error}`]);
    }
  }, [files, formatConsoleOutput, parseTestResults, setActiveOutputTab, setTestLines]);

  const handleGetSolution = useCallback(async () => {
    if (!solutionUnlocked) return;

    setActiveOutputTab('submission');
    setSubmissionLines(['Loading solution workspace...']);

    try {
      await loadWorkspace('solution');
      setSubmissionLines(['Solution workspace loaded successfully.']);
    } catch (error) {
      setSubmissionLines([`Error: ${error.message || 'Unable to load solution workspace'}`]);
    }
  }, [loadWorkspace, setActiveOutputTab, setSubmissionLines, solutionUnlocked]);

  const handleFinish = useCallback(async () => {
    const totalTests = (testResults.passed || 0) + (testResults.failed || 0);
    if (totalTests === 0) {
      setActiveOutputTab('submission');
      setSubmissionLines(['Please run tests before finishing.']);
      return;
    }

    // Prevent accidental finish/submission
    if (!window.confirm('Are you sure you want to finish and submit your solution? This will lock further edits.')) {
      setSubmissionLines(['Submission cancelled by user.']);
      return;
    }

    setActiveOutputTab('submission');
    setSubmissionLines(['Submitting code, please wait...']);

    try {
      const response = await submitSolution(files);
      const results = parseTestResults(response.output);
      setTestResults(results);

      if (response.success) {
        setSolutionUnlocked(true);
      }

      setSubmissionLines(createSubmissionLines(response.success, results));
    } catch (error) {
      setSubmissionLines([`Error submitting solution: ${error.message || error}`]);
    }
  }, [files, parseTestResults, setActiveOutputTab, setSubmissionLines, setTestResults]);

  const handleAction = useCallback((action) => {
    if (action === 'hints') {
      setSubmissionLines(['Hint: focus on MVC controllers, EF Core configuration, and clean validation.']);
    }
    if (action === 'reset') {
      resetEditor();
      setSubmissionLines(['Editor reset to starter files.']);
    }
  }, [resetEditor, setSubmissionLines]);

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
        handleBuildAndTest();
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        handleTest();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
}, [handleBuildAndTest, handleTest, saveChanges]);

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
              <Timer active={!timeExpired} onExpire={() => setTimeExpired(true)} />
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
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{workspaceLoading ? 'Loading workspace...' : unsavedChanges ? 'Unsaved changes' : workspaceLoaded ? 'Saved' : 'Workspace unavailable'}</p>
                  {workspaceError ? <p className="mt-2 text-sm text-rose-600">{workspaceError}</p> : null}
                </div>
                {/* <button onClick={toggleFullscreen} className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button> */}
              </div>
            </div>
          </aside>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-shrink-0">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Editor</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Coding Workspace</h2>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 overflow-x-auto">
                  <button type="button" onClick={handleBuildAndTest} className="inline-flex whitespace-nowrap items-center gap-2 rounded-3xl bg-[#84BD00] px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-500">Build & Run Tests</button>
                  <button type="button" onClick={handleTest} className="inline-flex whitespace-nowrap items-center gap-2 rounded-3xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Run Tests</button>
                  <button type="button" onClick={handleGetSolution} disabled={!solutionUnlocked} className="inline-flex whitespace-nowrap items-center gap-2 rounded-3xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 hover:bg-slate-700">Get Solution</button>
                  <button type="button" onClick={handleFinish} className="inline-flex whitespace-nowrap items-center gap-2 rounded-3xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">Finish</button>
                </div>
              </div>
              <div className="h-[calc(100vh-340px)] overflow-hidden rounded-3xl bg-slate-950">
                {workspaceLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-300">Loading workspace from backend...</div>
                ) : (
                  <Editor
                    height="100%"
                    defaultLanguage="csharp"
                    value={activeFile?.content || ''}
                    theme={editorTheme}
                    options={{
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
                <AssessmentDetails activeTab={activeRightTab} onChangeTab={setActiveRightTab} problemMeta={problemMeta} onAction={handleAction} />
                {/* <KeyboardShortcuts /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
