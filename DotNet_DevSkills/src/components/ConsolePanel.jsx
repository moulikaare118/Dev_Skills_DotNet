export default function ConsolePanel({ activeTab, outputLines, testLines, submissionLines, setActiveTab, testResults }) {
  const getTotalTests = () => {
    return (testResults?.passed || 0) + (testResults?.failed || 0);
  };

  const renderTestSummary = () => {
    if (getTotalTests() === 0) return null;
    
    return (
      <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Test Results Summary</p>
            <div className="mt-2 flex gap-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-400">{testResults?.passed || 0}</span>
                <span className="text-sm text-slate-300">Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-400">{testResults?.failed || 0}</span>
                <span className="text-sm text-slate-300">Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-300">{getTotalTests()}</span>
                <span className="text-sm text-slate-300">Total</span>
              </div>
            </div>
          </div>
          {testResults?.failed === 0 && getTotalTests() > 0 && (
            <div className="text-center">
              <p className="text-sm font-semibold text-green-400">✓ All Tests Passed</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-500">Console</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Build & Execution Output</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['output', 'tests', 'submission'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${activeTab === tab ? 'bg-sky-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab === 'output' ? 'Build Output' : tab === 'tests' ? 'Test Results' : 'Execution Output'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 min-h-[260px] overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100 shadow-inner shadow-slate-900/10">
        {activeTab === 'tests' && renderTestSummary()}
        {activeTab === 'output' && (outputLines.length > 0 ? outputLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        )) : <p className="text-slate-400 py-2">Click Build & Run Tests or Run Tests to see output...</p>)}
        {activeTab === 'tests' && (testLines.length > 0 ? testLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        )) : <p className="text-slate-400 py-2">Click Build & Run Tests or Run Tests to run test cases...</p>)}
        {activeTab === 'submission' && (submissionLines.length > 0 ? submissionLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        )) : <p className="text-slate-400 py-2">Use Build & Run Tests to unlock solution access...</p>)}
      </div>
    </div>
  );
}
