import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../components/ThemeToggle';
import FileExplorer from '../components/FileExplorer';
import AssessmentDetails from '../components/AssessmentDetails';
import ConsolePanel from '../components/ConsolePanel';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import Timer from '../components/Timer';
import useIDEStore from '../store/useIDEStore';
import { runCode, runTests, submitSolution } from '../services/api';

const problemMeta = {
  title: 'MainExam: E-Learning Platform',
  difficulty: 'Medium',
  timeLimit: '120 minutes',
  language: 'C#',
  description: 'Build an ASP.NET Core MVC e-learning platform with EF Core database layer, course management, student performance analytics, and xUnit tests.',
  inputFormat: 'Use the project structure with Models, Services, DTOs, and Controllers. Query data from the in-memory or SQLite database.',
  outputFormat: 'Return console output, test results, and HTTP responses from the MVC controllers.',
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
  const fullscreen = useIDEStore((state) => state.fullscreen);
  const [timeExpired, setTimeExpired] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const workspaceSyncStarted = useRef(false);
  const setActiveFile = useIDEStore((state) => state.setActiveFile);
  const updateFileContent = useIDEStore((state) => state.updateFileContent);
  const setActiveOutputTab = useIDEStore((state) => state.setActiveOutputTab);
  const setActiveRightTab = useIDEStore((state) => state.setActiveRightTab);
  const setOutputLines = useIDEStore((state) => state.setOutputLines);
  const setTestLines = useIDEStore((state) => state.setTestLines);
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
      loadWorkspace();
    }
  }, [loadWorkspace]);

  const handleRun = useCallback(async () => {
    setActiveOutputTab('output');
    setOutputLines(['Launching code execution...']);

    try {
      const response = await runCode(files);
      setOutputLines(formatConsoleOutput(response, 'build'));
    } catch (error) {
      setOutputLines([`Error: ${error.message || error}`]);
    }
  }, [files, formatConsoleOutput, setActiveOutputTab, setOutputLines]);

  const handleTest = useCallback(async () => {
    setActiveOutputTab('tests');
    setTestLines(['Running tests...']);

    try {
      const response = await runTests(files);
      setTestLines(formatConsoleOutput(response, 'test'));
    } catch (error) {
      setTestLines([`Error: ${error.message || error}`]);
    }
  }, [files, formatConsoleOutput, setActiveOutputTab, setTestLines]);

  const handleSubmit = useCallback(async () => {
    setActiveOutputTab('submission');
    setSubmissionLines(['Submitting final solution...']);

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
    if (!timeExpired && !solutionUnlocked) return;

    setActiveOutputTab('submission');
    setSubmissionLines(['Loading solution workspace...']);

    try {
      await loadWorkspace('solution');
      setSubmissionLines(['Solution workspace loaded successfully.']);
    } catch (error) {
      setSubmissionLines([`Error: ${error.message || 'Unable to load solution workspace'}`]);
    }
  }, [loadWorkspace, setActiveOutputTab, setSubmissionLines, solutionUnlocked, timeExpired]);

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
        handleRun();
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        handleTest();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleRun, handleTest, saveChanges]);

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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Editor</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Coding Workspace</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleRun} className="inline-flex items-center gap-2 rounded-3xl bg-[#84BD00] px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-500">Run</button>
                  <button onClick={handleTest} className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Test</button>
                  <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400">Submit</button>
                  <button onClick={handleGetSolution} disabled={!timeExpired && !solutionUnlocked} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 hover:bg-slate-700">Get Solution</button>
                  <button onClick={resetEditor} className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Reset</button>
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
