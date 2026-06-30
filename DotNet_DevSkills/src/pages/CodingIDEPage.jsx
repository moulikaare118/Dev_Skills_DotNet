import { useEffect, useMemo, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../components/ThemeToggle';
import FileExplorer from '../components/FileExplorer';
import AssessmentDetails from '../components/AssessmentDetails';
import ConsolePanel from '../components/ConsolePanel';
import Timer from '../components/Timer';
import useIDEStore from '../store/useIDEStore';
import { loadAssessmentMeta } from '../services/api';
import { submitAndWaitForResults, formatResultsForConsole, parseTestResults } from '../services/judge0Integration';
import { createAndEncodeProjectZip } from '../services/zipGenerator';

const problemMeta = {
  title: 'MainCode-Sol: E-Learning Platform',
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

const fallbackAssessmentOptions = [
  { key: 'main-exam', label: 'Main Exam Code' },
  { key: 'hon-orders', label: 'HON Orders Code' }
];

function getAssessmentOptions(assessmentMeta) {
  const sourceOptions = assessmentMeta?.codeEditor?.assessments;

  if (Array.isArray(sourceOptions) && sourceOptions.length > 0) {
    return sourceOptions
      .map((assessment) => ({
        key: String(assessment.key || '').trim().toLowerCase(),
        label: assessment.label || assessment.key
      }))
      .filter((assessment) => assessment.key);
  }

  return fallbackAssessmentOptions;
}

function getEditorTheme(theme) {
  return theme === 'dark' ? 'vs-dark' : 'vs-light';
}

export default function CodingIDEPage({ theme, onToggleTheme }) {
  const [assessmentMeta, setAssessmentMeta] = useState(null);
  const [selectedAssessmentKey, setSelectedAssessmentKey] = useState('');
  const activeFileId = useIDEStore((state) => state.activeFileId);
  const files = useIDEStore((state) => state.files);
  const activeOutputTab = useIDEStore((state) => state.activeOutputTab);
  const activeRightTab = useIDEStore((state) => state.activeRightTab);
  const outputLines = useIDEStore((state) => state.outputLines);
  const testLines = useIDEStore((state) => state.testLines);
  const submissionLines = useIDEStore((state) => state.submissionLines);
  const unsavedChanges = useIDEStore((state) => state.unsavedChanges);
  const workspaceLoading = useIDEStore((state) => state.workspaceLoading);
  const workspaceError = useIDEStore((state) => state.workspaceError);
  const workspaceMode = useIDEStore((state) => state.workspaceMode);
  const testResults = useIDEStore((state) => state.testSummary);
  const fullscreen = useIDEStore((state) => state.fullscreen);
  const [timeExpired, setTimeExpired] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timerResetSignal, setTimerResetSignal] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
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
  const assessmentOptions = useMemo(() => getAssessmentOptions(assessmentMeta), [assessmentMeta]);
  const activeAssessment = useMemo(
    () => assessmentOptions.find((assessment) => assessment.key === selectedAssessmentKey) || null,
    [assessmentOptions, selectedAssessmentKey]
  );
  const todoFiles = useMemo(() => {
    if (!selectedAssessmentKey || !Array.isArray(files) || files.length === 0) {
      return [];
    }

    return files
      .filter((file) => typeof file.content === 'string' && /todo/i.test(file.content))
      .map((file) => file.path || file.name || file.id)
      .filter((value, index, self) => value && self.indexOf(value) === index);
  }, [files, selectedAssessmentKey]);
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  const activeProblemMeta = useMemo(() => {
    const assessment = assessmentMeta?.assessment;
    if (!assessment) {
      return problemMeta;
    }

    return {
      title: assessment.title || problemMeta.title,
      difficulty: assessment.difficulty || problemMeta.difficulty,
      timeLimit: assessment.timeLimit || problemMeta.timeLimit,
      language: assessment.language || problemMeta.language,
      description: assessment.description || problemMeta.description,
      inputFormat: assessment.inputFormat || problemMeta.inputFormat,
      outputFormat: assessment.outputFormat || problemMeta.outputFormat,
      task: assessment.task || problemMeta.task,
      solution: assessment.solution || problemMeta.solution,
      examples: assessment.examples || problemMeta.examples,
      instructions: assessment.requirements || problemMeta.instructions,
      tasks: assessment.tasks || problemMeta.tasks
    };
  }, [assessmentMeta, selectedAssessmentKey]);

  useEffect(() => {
    loadAssessmentMeta().then(setAssessmentMeta).catch(() => setAssessmentMeta(null));
  }, []);

  useEffect(() => {
    if (!assessmentOptions.length) {
      return;
    }

    if (!selectedAssessmentKey) {
      const defaultKey = assessmentMeta?.codeEditor?.defaultAssessmentKey || assessmentOptions[0]?.key;
      if (defaultKey) {
        setSelectedAssessmentKey(defaultKey);
      }
      return;
    }

    if (!assessmentOptions.some((assessment) => assessment.key === selectedAssessmentKey)) {
      setSelectedAssessmentKey(assessmentOptions[0]?.key || 'main-exam');
    }
  }, [assessmentMeta, assessmentOptions, selectedAssessmentKey]);

  useEffect(() => {
    if (!selectedAssessmentKey) {
      return;
    }

    setTimeExpired(false);
    setTimerResetSignal((value) => value + 1);
    setTimerStarted(true);
    setSolutionUnlocked(false);
    setSubmitted(false);

    loadWorkspace({ assessmentKey: selectedAssessmentKey, mode: 'starter' });
  }, [loadWorkspace, selectedAssessmentKey]);

  useEffect(() => {
    if (!timeExpired) {
      return;
    }

    setSolutionUnlocked(true);
    window.alert('Time is up. Submission is closed, and solution access is now enabled.');
  }, [timeExpired]);

  const handleBuildAndRunTests = useCallback(async () => {
    setActiveOutputTab('output');
    setOutputLines(['Packing the current multi-file .NET project for browser-based execution...']);
    setTestLines(['Submitting the workspace to Judge0 for build and test execution...']);
    setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });

    try {
      const projectFiles = files.map((file) => ({ path: file.path || file.name, content: file.content || '' }));
      const packedProject = await createAndEncodeProjectZip(projectFiles, { includeScripts: true });

      if (!packedProject.success) {
        throw new Error(packedProject.error || 'Unable to package the current project.');
      }

      const result = await submitAndWaitForResults(
        {
          additionalFiles: packedProject.base64,
          compileCmd: 'bash compile.sh',
          runCmd: 'bash run.sh'
        },
        { maxAttempts: 60, delayMs: 1000 }
      );

      const formattedOutput = formatResultsForConsole(result);
      const parsedSummary = parseTestResults(result.output || result.stdout || result.compileOutput || '');
      const summary = {
        total: parsedSummary.totalTests ?? 0,
        passed: parsedSummary.passedTests ?? 0,
        failed: parsedSummary.failedTests ?? 0,
        skipped: parsedSummary.skippedTests ?? 0,
        duration: null
      };

      setOutputLines(formattedOutput.length > 0 ? formattedOutput : ['No output returned from Judge0.']);
      setTestLines([
        result?.success ? 'Judge0 completed the build and test run.' : 'Judge0 reported a build or test issue.',
        result?.status ? `Status: ${result.status}` : null,
        typeof result?.exit_code === 'number' ? `Exit code: ${result.exit_code}` : null,
        `Passed: ${summary.passed}`,
        `Failed: ${summary.failed}`,
        `Skipped: ${summary.skipped}`,
        `Total: ${summary.total}`
      ].filter(Boolean));
      setTestSummary(summary);
    } catch (error) {
      const message = error?.message || 'The Judge0 execution flow is unavailable.';
      setOutputLines([message]);
      setTestLines([message]);
      setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });
    }
  }, [files, setActiveOutputTab, setOutputLines, setTestLines, setTestSummary]);

  const handleSubmit = useCallback(async () => {
    setActiveOutputTab('submission');
    setSubmissionLines(['Packing the current multi-file .NET project for submission evaluation...']);

    try {
      const projectFiles = files.map((file) => ({ path: file.path || file.name, content: file.content || '' }));
      const packedProject = await createAndEncodeProjectZip(projectFiles, { includeScripts: true });

      if (!packedProject.success) {
        throw new Error(packedProject.error || 'Unable to package the current project for submission.');
      }

      const result = await submitAndWaitForResults(
        {
          additionalFiles: packedProject.base64,
          compileCmd: 'bash compile.sh',
          runCmd: 'bash run.sh'
        },
        { maxAttempts: 60, delayMs: 1000 }
      );

      const formattedOutput = formatResultsForConsole(result);
      setSubmissionLines(formattedOutput.length > 0 ? formattedOutput : ['Submission completed.']);
      setSubmitted(true);
      setSolutionUnlocked(true);
    } catch (error) {
      const message = error?.message || 'Submission failed.';
      setSubmissionLines([message]);
      setSubmitted(true);
      setSolutionUnlocked(true);
    }
  }, [files, setActiveOutputTab, setSubmissionLines]);

  const handleGetSolution = useCallback(async () => {
    setActiveOutputTab('submission');
    setSubmissionLines(['Loading the solution workspace into the editor...']);

    try {
      const assessmentKey = selectedAssessmentKey || assessmentOptions[0]?.key || 'main-exam';
      await loadWorkspace({ assessmentKey, mode: 'solution' });
      setSubmissionLines(['Solution files have been loaded into the workspace.']);
      setSolutionUnlocked(true);

      // After loading the solution workspace, automatically run the build/test
      // so the solution gets compiled and any test output appears in the console.
      await handleBuildAndRunTests();
    } catch (error) {
      const message = error?.message || 'Unable to load the solution workspace.';
      setSubmissionLines([message]);
    }
  }, [loadWorkspace, selectedAssessmentKey, assessmentOptions, setActiveOutputTab, setSubmissionLines, handleBuildAndRunTests]);

  const handleAction = useCallback(async (action) => {
    if (action === 'hints') {
      setSubmissionLines(['Hint: focus on MVC controllers, EF Core configuration, and clean validation.']);
      return;
    }

    if (action === 'finish') {
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
      setTimeExpired(false);
      setSolutionUnlocked(false);
      setTimerResetSignal((value) => value + 1);
      window.localStorage.removeItem('devskills-assessment-timer');
      setTimerStarted(true);

      // Reload starter workspace and reset IDE state
      await resetEditor();

      setActiveOutputTab('output');
      setActiveRightTab('problem');
      setOutputLines(['Ready to run your code.']);
      setSubmissionLines([]);
      setTestLines(['Test runner is ready.']);
      setTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0, duration: null });
      setSubmitted(false);
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
            <div className="rounded-3xl bg-[#84BD00] px-4 py-2 text-sm font-semibold text-slate-950">MainCode-Sol</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">E-Learning Assessment IDE</p>
              <p className="text-xs text-slate-500">.NET Core / C# | Course Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time Remaining</p>
              <Timer active={timerStarted && !timeExpired && !submitted} onExpire={() => setTimeExpired(true)} resetSignal={timerResetSignal} />
            </div>
            {/* <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">Candidate: Alex</div> */}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-160px)] gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] min-w-0">
          <aside className="flex min-w-0 flex-col gap-5">
            <div className="w-full max-w-[280px] lg:max-w-none">
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFile}
                onSave={saveChanges}
                onRefresh={refreshFiles}
              />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Files with TODOs</h3>
              {todoFiles.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {todoFiles.map((filePath) => (
                    <li key={filePath} className="break-words">{filePath}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No TODO files found for the selected assessment.</p>
              )}
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
                      {activeAssessment?.label || 'No assessment selected'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-w-[240px] flex-1 sm:flex-none sm:order-first">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assessment Type</span>
                    <select
                      value={selectedAssessmentKey}
                      onChange={(event) => setSelectedAssessmentKey(event.target.value)}
                      disabled={workspaceLoading}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-200"
                    >
                      <option value="">Select an assessment</option>
                      {assessmentOptions.map((assessment) => (
                        <option key={assessment.key} value={assessment.key}>
                          {assessment.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleBuildAndRunTests} className="inline-flex items-center gap-2 rounded-3xl bg-[#84BD00] px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-500">Run on Judge0</button>
                  <button onClick={handleSubmit} disabled={submitted || timeExpired} className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Submit</button>
                  <button onClick={handleGetSolution} disabled={!submitted && !solutionUnlocked} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 hover:bg-slate-700">Get Solution</button>
                  <button onClick={resetEditor} disabled={submitted} className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Reset</button>
                  </div>
                </div>
              </div>
              <div className="min-h-[60vh] md:min-h-[70vh] lg:h-[calc(100vh-340px)] overflow-hidden rounded-3xl bg-slate-950">
                {workspaceLoading ? (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">Loading assessment workspace...</div>
                ) : !selectedAssessmentKey ? (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
                    <div className="max-w-lg space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20">
                      <p className="text-base font-semibold text-slate-100">No code selected yet.</p>
                      <p className="text-sm text-slate-400">Choose an assessment type from the dropdown to load its source code.</p>
                    </div>
                  </div>
                ) : workspaceError || !activeFile ? (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
                    <div className="max-w-lg space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20">
                      <p className="text-base font-semibold text-slate-100">{workspaceError || `No code is available for ${activeAssessment?.label || 'the selected assessment'}.`}</p>
                      <p className="text-sm text-slate-400">Select another assessment type or verify that the configured source root exists.</p>
                    </div>
                  </div>
                ) : (
                  <Editor
                    key={`${selectedAssessmentKey}:${activeFile?.id || 'editor'}`}
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

            <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
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
