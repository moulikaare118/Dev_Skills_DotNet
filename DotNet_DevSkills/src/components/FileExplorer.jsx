import { useMemo, useState } from 'react';
import { HiChevronDown, HiChevronRight, HiSearch, HiRefresh, HiSave } from 'react-icons/hi';

export default function FileExplorer({ files, activeFileId, onSelectFile, onSave, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set(['HON.Academy.DAL', 'HON.Academy.Web', 'HON.Academy.XunitTests']));

  const visibleFiles = useMemo(
    () => files
      .filter((file) => !file.name.toLowerCase().endsWith('.sln'))
      .filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()) || file.path.toLowerCase().includes(searchTerm.toLowerCase())),
    [files, searchTerm]
  );

  const fileTree = useMemo(() => {
    const tree = {};

    visibleFiles.forEach((file) => {
      const parts = file.path.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        const isFolder = index < parts.length - 1;
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isFolder,
            file: isFolder ? undefined : file,
            children: {}
          };
        }

        if (isFolder) {
          current = current[part].children;
        }
      });
    });

    const sortNodes = (nodes) =>
      Object.values(nodes).sort((a, b) => {
        if (a.isFolder !== b.isFolder) {
          return a.isFolder ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

    return sortNodes(tree);
  }, [visibleFiles]);

  const toggleFolder = (path) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderNode = (node, depth = 0) => {
    if (node.isFolder) {
      const expanded = expandedPaths.has(node.path);
      return (
        <div key={node.path} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleFolder(node.path)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            style={{ paddingLeft: `${depth * 0.85}rem` }}
          >
            <span className="inline-flex items-center gap-2">
              {expanded ? <HiChevronDown className="h-4 w-4 text-slate-400" /> : <HiChevronRight className="h-4 w-4 text-slate-400" />}
              <span className="font-medium text-slate-900">{node.name}</span>
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Folder</span>
          </button>
          {expanded && (
            <div className="space-y-1">
              {Object.values(node.children)
                .sort((a, b) => {
                  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        type="button"
        onClick={() => onSelectFile(node.file.id)}
        className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${activeFileId === node.file.id ? 'bg-sky-500 text-slate-950' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
        style={{ paddingLeft: `${depth * 0.85 + 1.5}rem` }}
      >
        <span>{node.name}</span>
        {node.file.readOnly && <span className="text-xs text-slate-500">RO</span>}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">Solution Explorer</p>
          <p className="text-xs text-slate-500">Folder tree on the left</p>
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
          <HiRefresh className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
        <div className="relative">
          <HiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search files"
            className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
          />
        </div>
      </div> */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">Project Tree</div>
        <div className="space-y-1">{fileTree.map((node) => renderNode(node))}</div>
      </div>

      {/* <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <button onClick={onSave} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#84BD00] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500">
          <HiSave className="h-4 w-4" /> Save Changes
        </button>
        <button onClick={onRefresh} className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          <HiRefresh className="h-4 w-4" /> Refresh Files
        </button>
      </div> */}
    </div>
  );
}
