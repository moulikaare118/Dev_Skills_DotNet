import { useEffect, useState } from 'react';
import { buildUploadedZip, testUploadedZip } from '../services/api';

export default function BuildAndTestPanel({ uploadedFile, disabled }) {
  const [buildResult, setBuildResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  // Auto-run build and tests when a new file is uploaded
  useEffect(() => {
    if (!uploadedFile || disabled) {
      return;
    }

    const runBuildAndTests = async () => {
      setRunning(true);
      setError('');
      setBuildResult(null);
      setTestResults(null);

      try {
        // First, run the build
        const buildRes = await buildUploadedZip(uploadedFile);
        setBuildResult(buildRes);

        // Then, run the tests
        const testRes = await testUploadedZip(uploadedFile);
        setTestResults(testRes);
      } catch (err) {
        setError(err?.message || 'Build and test execution failed.');
      } finally {
        setRunning(false);
      }
    };

    runBuildAndTests();
  }, [uploadedFile, disabled]);

  useEffect(() => {
    if (!uploadedFile) {
      setBuildResult(null);
      setTestResults(null);
      setError('');
    }
  }, [uploadedFile]);

  const runBuild = async () => {
    if (!uploadedFile) return;
    setRunning(true);
    setError('');
    setBuildResult(null);
    try {
      const result = await buildUploadedZip(uploadedFile);
      setBuildResult(result);
    } catch (buildError) {
      setError(buildError?.message || 'Build failed.');
    } finally {
      setRunning(false);
    }
  };

  const runTests = async () => {
    if (!uploadedFile) return;
    setRunning(true);
    setError('');
    setTestResults(null);
    try {
      const result = await testUploadedZip(uploadedFile);
      setTestResults(result);
    } catch (testError) {
      setError(testError?.message || 'Test run failed.');
    } finally {
      setRunning(false);
    }
  };

  const runBuildAndTests = async () => {
    if (!uploadedFile) return;
    setRunning(true);
    setError('');
    setBuildResult(null);
    setTestResults(null);
    try {
      const buildRes = await buildUploadedZip(uploadedFile);
      setBuildResult(buildRes);

      const testRes = await testUploadedZip(uploadedFile);
      setTestResults(testRes);
    } catch (err) {
      setError(err?.message || 'Build and test execution failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Build and Test Cases</h3>
          <p className="mt-2 text-sm text-slate-600">Your solution is automatically built and tested on upload.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={disabled || !uploadedFile || running}
            onClick={runBuildAndTests}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Re-run Build & Tests
          </button>
          <button
            type="button"
            disabled={disabled || !uploadedFile || running}
            onClick={runBuild}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Build Only
          </button>
          <button
            type="button"
            disabled={disabled || !uploadedFile || running}
            onClick={runTests}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Tests Only
          </button>
        </div>
      </div>

      {running && !buildResult && !testResults ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">⏳ Running build and tests...</p>
          <p className="mt-1 text-sm text-blue-700">Please wait while your solution is being processed.</p>
        </div>
      ) : null}

      {buildResult ? (
        <div className={`rounded-2xl border p-4 text-slate-800 ${buildResult.success ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <p className="font-semibold">✓ Build Status: {buildResult.success ? 'Passed' : 'Failed'}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{buildResult.output}</pre>
        </div>
      ) : null}

      {testResults ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">✓ Test Case Results</p>
              <p className="text-slate-500">Latest execution results for uploaded file.</p>
            </div>
            <div className={`inline-flex items-center gap-3 rounded-2xl px-4 py-2 text-sm ${testResults.success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <span className="font-semibold">{testResults.success ? '✓ Tests passed' : '✗ Tests failed'}</span>
            </div>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{testResults.output}</pre>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm font-medium text-rose-600">✗ Error: {error}</p> : null}
    </div>
  );
}
