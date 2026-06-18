export default function KeyboardShortcuts() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Keyboard Shortcuts</h3>
      <ul className="mt-3 space-y-2">
        <li><span className="font-semibold">Ctrl + S</span> Save</li>
        <li><span className="font-semibold">Ctrl + Enter</span> Run Code</li>
        <li><span className="font-semibold">Ctrl + Shift + T</span> Run Tests</li>
      </ul>
    </div>
  );
}
