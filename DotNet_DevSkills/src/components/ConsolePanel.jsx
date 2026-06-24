export default function ConsolePanel({ activeTab, outputLines, testLines, submissionLines, setActiveTab, testResults }) {
  const getTotalTests = () => {
    return (testResults?.passed || 0) + (testResults?.failed || 0);
  };

  const renderTestSummary = () => {
    if (getTotalTests() === 0) return null;
    
    const allTestsPassed = testResults?.failed === 0 && getTotalTests() > 0;
    const totalTests = getTotalTests();
    
    return (
      <div className={`mb-4 rounded-lg border p-4 ${allTestsPassed ? 'border-emerald-600 bg-emerald-950/50' : 'border-rose-600 bg-rose-950/50'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Test Results Summary</p>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-emerald-400">{testResults?.passed || 0}</span>
                <span className="text-sm text-slate-300">Test Case(s) Passed</span>
              </div>
              {testResults?.failed > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-400">{testResults?.failed || 0}</span>
                  <span className="text-sm text-slate-300">Test Case(s) Failed</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>Total: {totalTests}</span>
              </div>
            </div>
          </div>
          {allTestsPassed && (
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">✓ Build Success</p>
              <p className="text-sm font-semibold text-emerald-300 mt-1">All Test Cases Passed</p>
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
        )) : <p className="text-slate-400 py-2">Click Build & Run Tests to see output...</p>)}
        {activeTab === 'tests' && (testLines.length > 0 ? testLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        )) : <p className="text-slate-400 py-2">Click Build & Run Tests to run test cases...</p>)}
        {activeTab === 'submission' && (submissionLines.length > 0 ? submissionLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        )) : <p className="text-slate-400 py-2">Use Build & Run Tests to unlock solution access...</p>)}
      </div>
    </div>
  );
}
