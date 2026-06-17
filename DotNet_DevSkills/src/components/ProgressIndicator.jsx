export default function ProgressIndicator() {
  const steps = [
    { label: 'Landing', completed: true },
    { label: 'Task Selection', completed: true },
    { label: 'Assessment', completed: true }
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${step.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{index + 1}</span>
            <span className={`font-medium ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
