import { useMemo, useState } from 'react';

const MAX_SIZE_BYTES = 30 * 1024 * 1024;

export default function UploadSection({ onFileUploaded, disabled }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onSelect = (event) => {
    setError('');
    const selected = event.target.files?.[0];
    if (!selected) return;
    const extension = selected.name.split('.').pop()?.toLowerCase();
    if (extension !== 'zip') {
      setError('Please upload a .zip file only.');
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File exceeds maximum size of 30 MB.');
      return;
    }
    setFile(selected);
    onFileUploaded(selected);
  };

  const displayName = useMemo(() => file?.name || 'No file selected yet.', [file]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Upload ZIP File</h3>
          <p className="mt-2 text-sm text-slate-600">Upload your updated starter code as a ZIP file. The latest upload will be your active submission.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className={`inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${disabled ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'}`}>
            <input type="file" accept=".zip" className="hidden" onChange={onSelect} disabled={disabled} />
            {disabled ? 'Upload disabled' : file ? 'Replace ZIP File' : 'Upload ZIP File'}
          </label>
          {file ? (
            <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Current file: {file.name}</span>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Selected file</p>
          <p className="mt-2 font-medium text-slate-800">{displayName}</p>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
