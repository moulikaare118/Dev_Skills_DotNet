import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const instructions = [
  'Time information: 3 hours 30 minutes.',
  'Initially the base code must be downloaded.',
  'The base code contains TODO comments.',
  'Already written code should not be changed.',
  'After writing code, candidate must upload the file again.',
  'Uploaded file must be below 30 MB.',
  'Certain large files must be removed before upload.'
];

export default function AssessmentLandingPage({ theme, onToggleTheme }) {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Assessment</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">DevSkiller Coding Assessment</h1>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome to your assessment</h2>
            <p className="text-slate-600 dark:text-slate-300">Please review the instructions below carefully before starting. You will need to download the starter code, complete the task locally, and upload your solution.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Test summary</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Time Limit</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">3h 30m</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Task type</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">Download / Upload Code</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Assessment instructions</h3>
            <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
              {instructions.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Theme</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark modes.</p>
              </div>
              <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span className="text-sm text-slate-700">I have read and accept the Terms of the Assessment</span>
            </label>
          </div>

          <button
            type="button"
            disabled={!accepted}
            onClick={() => navigate('/task-selection')}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Start / Continue
          </button>
        </aside>
      </section>
    </main>
  );
}
