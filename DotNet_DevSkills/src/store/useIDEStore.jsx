import { create } from 'zustand';
import { loadSolutionWorkspace, loadWorkspace } from '../services/api';
import { fallbackWorkspaceFiles } from '../data/fallbackWorkspace';

const initialFiles = fallbackWorkspaceFiles.map((file) => ({ ...file }));

function findDefaultTaskFileId(files) {
  const taskFile = files.find(
    (file) => file.path?.endsWith('CourseServices.cs') || file.name === 'CourseServices.cs' || file.id === 'service-courseservice'
  );
  return taskFile?.id || files[0]?.id || null;
}

const defaultState = {
  files: initialFiles,
  originalFiles: initialFiles,
  activeFileId: null,
  activeOutputTab: 'output',
  activeRightTab: 'problem',
  outputLines: ['Ready to run your code.'],
  testLines: ['Test runner is ready.'],
  submissionLines: [],
  unsavedChanges: false,
  fullscreen: false,
  workspaceLoaded: true,
  workspaceLoading: false,
  workspaceError: ''
};

const useIDEStore = create((set, get) => ({
  ...defaultState,
  setActiveFile: (id) => set({ activeFileId: id }),
  setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setOutputLines: (lines) => set({ outputLines: lines }),
  setTestLines: (lines) => set({ testLines: lines }),
  setSubmissionLines: (lines) => set({ submissionLines: lines }),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  saveChanges: () => set({ unsavedChanges: false }),
  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((file) => (file.id === id ? { ...file, content } : file)),
      unsavedChanges: true
    })),
  loadWorkspace: async (mode = 'starter') => {
    if (get().workspaceLoading) {
      return;
    }

    set({ workspaceLoading: true, workspaceError: '' });

    try {
      const payload = mode === 'solution' ? await loadSolutionWorkspace() : await loadWorkspace();
      const files = (payload.files || []).map((file) => ({
        ...file,
        readOnly: file.readOnly ?? false
      }));
      const firstFileId = files[0]?.id ?? null;

      set({
        files,
        originalFiles: files,
        activeFileId: files.some((file) => file.id === get().activeFileId)
          ? get().activeFileId
          : findDefaultTaskFileId(files),
        workspaceLoaded: true,
        workspaceLoading: false,
        unsavedChanges: false
      });
    } catch (error) {
      const files = fallbackWorkspaceFiles.map((file) => ({ ...file }));
      set({
        files,
        originalFiles: files,
        activeFileId: files.some((file) => file.id === get().activeFileId)
          ? get().activeFileId
          : findDefaultTaskFileId(files),
        workspaceLoading: false,
        workspaceLoaded: true,
        workspaceError: `Loaded fallback workspace because the backend was unavailable: ${error?.message || 'Failed to load workspace'}`,
        unsavedChanges: false
      });
    }
  },
  resetEditor: async () => {
    const { originalFiles, activeFileId } = get();
    set({
      files: originalFiles.map((file) => ({ ...file })),
      activeFileId: originalFiles.some((file) => file.id === activeFileId) ? activeFileId : originalFiles[0]?.id || null,
      unsavedChanges: false,
      outputLines: ['Editor reset to the backend workspace snapshot.'],
      testLines: ['Test runner is ready.'],
      submissionLines: []
    });
  },
  refreshFiles: async () => {
    await get().loadWorkspace();
    set({ outputLines: ['File tree refreshed.'], unsavedChanges: false });
  }
}));

export default useIDEStore;
