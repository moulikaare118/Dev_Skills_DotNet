import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { loadAssessmentMeta } from '../services/api';

const fallbackTaskCards = [
  {
    title: 'Git Repository',
    description: 'Select repository-based workflow.',
    disabled: true
  },
  {
    title: 'Download / Upload Code',
    description: 'Use starter code locally and upload a ZIP.',
    disabled: false
  },
  {
    title: 'Simple In-Browser Editor',
    description: 'Write code in the browser editor.',
    disabled: false
  }
];

export default function TaskSelectionPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    loadAssessmentMeta().then(setMeta).catch(() => setMeta(null));
  }, []);

  const taskCards = meta?.taskSelection?.cards?.length ? meta.taskSelection.cards : fallbackTaskCards;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{meta?.taskSelection?.title || "You're about to start a programming task"}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{meta?.taskSelection?.description || 'Choose the workflow you will use to complete the assessment.'}</p>
          </div>
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {taskCards.map((card) => (
            <button
              key={card.title}
              type="button"
              disabled={card.disabled}
              onClick={() => !card.disabled && navigate(card.title === 'Simple In-Browser Editor' ? '/ide' : '/assessment')}
              className={`group flex flex-col justify-between gap-4 rounded-3xl border p-6 text-left shadow-sm transition ${
                card.disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-slate-400 dark:text-slate-400'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{card.title}</h2>
                  {card.disabled ? (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Disabled</span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active</span>
                  )}
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
