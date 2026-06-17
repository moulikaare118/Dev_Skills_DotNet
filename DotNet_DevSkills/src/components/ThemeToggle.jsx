export default function ThemeToggle({ theme, onToggleTheme }) {
  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      Toggle theme
    </button>
  );
}
