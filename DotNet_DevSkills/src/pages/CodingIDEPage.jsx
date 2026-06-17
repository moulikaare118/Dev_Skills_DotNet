import { useState } from 'react';
import { FiPlay, FiCheckCircle, FiRefreshCcw } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import ThemeToggle from '../components/ThemeToggle';
import Timer from '../components/Timer';

const defaultCode = `using System;

public class Solution
{
    public static void Main(string[] args)
    {
        Console.WriteLine("Hello World");
    }
}
`;

const problem = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  constraints: [
    '2 <= nums.length <= 104',
    '-109 <= nums[i] <= 109',
    'Each input would have exactly one solution.'
  ],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0, 1]'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1, 2]'
    }
  ]
};

export default function CodingIDEPage({ theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('description');
  const [panelTab, setPanelTab] = useState('output');
  const [editorCode, setEditorCode] = useState(defaultCode);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [output, setOutput] = useState('Ready to run your code.');
  const [customInput, setCustomInput] = useState(`nums = [2,7,11,15]\ntarget = 9`);
  const [testResults, setTestResults] = useState([
    '✓ Test Case 1 Passed',
    '✓ Test Case 2 Passed',
    'Execution Time: 35ms',
    'Memory: 18MB'
  ]);
  const [submissionResult, setSubmissionResult] = useState([
    'Accepted',
    '25/25 Test Cases Passed',
    'Runtime: 42ms',
    'Memory: 20MB'
  ]);

  const editorTheme = 'light';
  const pageThemeClasses = 'bg-slate-100 text-slate-900';
  const panelClasses = 'border border-slate-200 bg-white text-slate-900';
  const panelSecondaryClasses = 'rounded-3xl border border-slate-200 bg-slate-50 text-slate-700';
  const cardHeaderClasses = 'bg-slate-50 border-slate-200 text-slate-700';

  const handleRun = async () => {
    setRunning(true);
    setPanelTab('output');

    try {
      const response = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: '00000000-0000-0000-0000-000000000000',
          code: editorCode,
          customInput
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        setOutput(`Error: ${errorText}`);
      } else {
        const data = await response.json();
        setOutput(data.output || data.standardOutput || 'No output returned.');
      }
    } catch (error) {
      setOutput(`Execution failed: ${error}. Make sure the backend is running on http://localhost:5000`);
    } finally {
      setRunning(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setPanelTab('tests');

    try {
      const response = await fetch('/api/code/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: '00000000-0000-0000-0000-000000000000',
          code: editorCode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        setTestResults([`Error: ${errorText}`]);
      } else {
        const data = await response.json();
        const lines = [
          `${data.passed}/${data.total} Test Cases Passed`
        ];

        if (data.results?.length) {
          lines.push(...data.results.map((result) =>
            `Test ${result.testCaseId.slice(0, 8)}: ${result.passed ? 'Passed' : 'Failed'} (${result.actualOutput} | expected ${result.expectedOutput})`
          ));
        }

        setTestResults(lines);
      }
    } catch (error) {
      setTestResults([`Test failed: ${error}. Make sure the backend is running on http://localhost:5000`]);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setPanelTab('submission');

    try {
      const response = await fetch('/api/code/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: '00000000-0000-0000-0000-000000000000',
          userId: '00000000-0000-0000-0000-000000000000',
          code: editorCode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        setSubmissionResult([`Error: ${errorText}`]);
      } else {
        const data = await response.json();
        setSubmissionResult([
          data.status,
          `${data.passed}/${data.total} Test Cases Passed`,
          `Runtime: ${data.executionTimeMs}ms`,
          `Memory: ${data.memoryKb}KB`
        ]);
      }
    } catch (error) {
      setSubmissionResult([`Submission failed: ${error}. Make sure the backend is running on http://localhost:5000`]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setEditorCode(defaultCode);
    setOutput('Hello World');
    setPanelTab('output');
  };

  return (
    <main className={`min-h-screen ${pageThemeClasses}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className={`rounded-3xl ${panelClasses} p-5 shadow-2xl shadow-slate-200/30`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">.NET Coding IDE</div>
            </div>
            <div className="text-center text-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-500">Problem</p>
              <h1 className="text-2xl font-semibold text-slate-900">Two Sum</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner shadow-slate-200/20">
                <span className="block text-slate-500">Timer</span>
                <Timer initialSeconds={12600} active />
              </div>
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiPlay className="h-4 w-4" /> Run
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="inline-flex items-center gap-2 rounded-3xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Test
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCheckCircle className="h-4 w-4" /> Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                <FiRefreshCcw className="h-4 w-4" /> Reset
              </button>
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[35%_65%] items-start">
          <aside className={`rounded-3xl ${panelClasses} p-5 shadow-lg shadow-slate-200/20`}>
            <div className={`flex items-center justify-between rounded-3xl border px-4 py-3 ${cardHeaderClasses}`}>
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'description'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tests')}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'tests'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Test Cases
              </button>
            </div>

            <div className={`mt-5 space-y-5 rounded-3xl ${panelSecondaryClasses} p-5 shadow-sm`}>
              {activeTab === 'description' ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-sm uppercase tracking-[0.2em] text-sky-400">Problem Statement</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{problem.description}</p>
                  </div>

                  <div>
                    <h2 className="text-sm uppercase tracking-[0.2em] text-sky-400">Constraints</h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {problem.constraints.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="text-sky-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-sm uppercase tracking-[0.2em] text-sky-400">Examples</h2>
                    <pre className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">nums = [2,7,11,15]
target = 9</pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Run custom input against your code.</p>
                  <textarea
                    className="h-56 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                    value={customInput}
                    onChange={(event) => setCustomInput(event.target.value)}
                  />
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <div className={`rounded-3xl ${panelClasses} p-4 shadow-lg shadow-slate-200/20`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-500">Editor Controls</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">IDE Toolbar</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={running}
                    className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiPlay className="h-4 w-4" /> {running ? 'Running...' : 'Run'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiCheckCircle className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                  >
                    <FiRefreshCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[65%_35%]">
              <div className={`rounded-3xl ${panelClasses} p-0 shadow-lg shadow-slate-200/20`}>
                <div className="h-[500px] overflow-hidden rounded-3xl bg-slate-50">
                  <Editor
                    height="100%"
                    defaultLanguage="csharp"
                    value={editorCode}
                    theme={editorTheme}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Liberation Mono, monospace'
                    }}
                    onChange={(value) => setEditorCode(value || defaultCode)}
                  />
                </div>
              </div>

              <section className={`rounded-3xl ${panelClasses} p-5 shadow-lg shadow-slate-200/20`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-sky-500">Console / Test Results</p>
                    <p className="text-slate-600">Mock output, test results, and submission feedback.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['output', 'tests', 'submission'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setPanelTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          panelTab === tab
                            ? 'bg-sky-500 text-slate-950'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tab === 'output' ? 'Output' : tab === 'tests' ? 'Test Results' : 'Submission Result'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 h-[500px] overflow-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {panelTab === 'output' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {running ? <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400" /> : null}
                        <span>{running ? 'Running code…' : 'Program output'}</span>
                      </div>
                      <pre className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">{output}</pre>
                    </div>
                  )}

                  {panelTab === 'tests' && (
                    <div className="space-y-3 text-slate-700">
                      {testResults.map((line) => (
                        <p key={line} className={line.startsWith('✓') ? 'text-emerald-500' : 'text-slate-600'}>{line}</p>
                      ))}
                    </div>
                  )}

                  {panelTab === 'submission' && (
                    <div className="space-y-3 text-slate-700">
                      {submissionResult.map((line) => (
                        <p key={line} className={line.includes('Accepted') ? 'text-emerald-400' : 'text-slate-300'}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
