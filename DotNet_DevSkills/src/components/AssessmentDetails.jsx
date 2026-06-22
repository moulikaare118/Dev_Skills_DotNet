export default function AssessmentDetails({ activeTab, onChangeTab, problemMeta, onAction, submitted = false }) {
  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-500">Assessment Details</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Problem Summary</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['problem', 'instructions', 'actions'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeTab(tab)}
              className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-sky-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab === 'problem' ? 'Problem Statement' : tab === 'instructions' ? 'Instructions' : 'Actions'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'problem' && (
        <div className="space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
          <div>
            <p className="font-semibold text-slate-900">{problemMeta.title}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>{problemMeta.difficulty}</span>
              <span>{problemMeta.timeLimit}</span>
              <span>{problemMeta.language}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-900">Task</p>
              <p className="mt-2 text-slate-600">{problemMeta.task}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Solution</p>
              <p className="mt-2 text-slate-600">{problemMeta.solution}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Description</p>
              <p className="mt-2 text-slate-600">{problemMeta.description}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Input Format</p>
              <p className="mt-2 text-slate-600">{problemMeta.inputFormat}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Output Format</p>
              <p className="mt-2 text-slate-600">{problemMeta.outputFormat}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Examples</p>
              <div className="mt-2 space-y-2 rounded-3xl bg-white p-4 text-slate-700 ring-1 ring-slate-200">
                <pre className="whitespace-pre-wrap text-sm">{problemMeta.examples}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'instructions' && (
        <div className="space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Instructions</p>
          <ul className="space-y-3">
            {problemMeta.instructions.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
          <button onClick={() => onAction('hints')} className="w-full rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">View Hints</button>
          <button onClick={() => onAction('reset')} disabled={submitted} className="w-full rounded-3xl bg-[#84BD00] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">Reset Solution</button>
        </div>
      )}
    </div>
  );
}
