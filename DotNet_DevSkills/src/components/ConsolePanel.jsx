export default function ConsolePanel({ activeTab, outputLines, testLines, submissionLines, setActiveTab }) {
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-sky-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab === 'output' ? 'Build Output' : tab === 'tests' ? 'Test Results' : 'Execution Output'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 min-h-[260px] overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100 shadow-inner shadow-slate-900/10">
        {activeTab === 'output' && outputLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        ))}
        {activeTab === 'tests' && testLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        ))}
        {activeTab === 'submission' && submissionLines.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap border-b border-slate-800 py-2 text-slate-200">{line}</p>
        ))}
      </div>
    </div>
  );
}
