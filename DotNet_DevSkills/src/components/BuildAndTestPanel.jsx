import { useEffect, useState } from 'react';

export default function BuildAndTestPanel({ uploadedFile, disabled }) {
  const [buildResult, setBuildResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!uploadedFile) {
      setBuildResult(null);
      setTestResults(null);
    }
  }, [uploadedFile]);

  const simulateBuild = () => {
    if (!uploadedFile) return;
    setRunning(true);
    setBuildResult(null);
    setTestResults(null);
    window.setTimeout(() => {
      setBuildResult({ success: true, message: 'Build completed successfully.' });
      setRunning(false);
    }, 800);
  };

  const simulateTests = () => {
    if (!uploadedFile) return;
    setRunning(true);
    setTestResults(null);
    window.setTimeout(() => {
      setTestResults({ passed: 3, failed: 1, details: [{ name: 'Task 1', status: 'passed' }, { name: 'Task 2', status: 'passed' }, { name: 'Task 3', status: 'passed' }, { name: 'Task 4', status: 'failed' }] });
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Build and Test Cases</h3>
          <p className="mt-2 text-sm text-slate-600">Validate your latest uploaded ZIP before submitting.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={disabled || !uploadedFile || running}
            onClick={simulateBuild}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Build
          </button>
          <button
            type="button"
            disabled={disabled || !uploadedFile || running}
            onClick={simulateTests}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Run Test Cases
          </button>
        </div>
      </div>

      {buildResult ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-slate-800">
          <p className="font-semibold">Build Status: Passed</p>
          <p>{buildResult.message}</p>
        </div>
      ) : null}

      {testResults ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Test Case Results</p>
              <p className="text-slate-500">Latest execution results for uploaded file.</p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <span className="font-semibold text-emerald-700">Passed: {testResults.passed}</span>
              <span className="font-semibold text-rose-600">Failed: {testResults.failed}</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {testResults.details.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-sm text-slate-700">{item.name}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.status === 'passed' ? 'Passed' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {running ? <p className="mt-4 text-sm text-slate-600">Running simulation...</p> : null}
    </div>
  );
}
