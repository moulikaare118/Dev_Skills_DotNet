import { create } from 'zustand';
import { fallbackWorkspaceFiles } from '../data/fallbackWorkspace';

const initialFiles = [];

const getDefaultFileId = (files, currentId = null) => {
  if (currentId && files.some((file) => file.id === currentId)) {
    return currentId;
  }

  const defaultFile = files.find(
    (file) => file.path.endsWith('CourseServices.cs') || file.name === 'CourseServices.cs'
  );

  return defaultFile?.id || files[0]?.id || null;
};

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
  testSummary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: null },
  testCases: [],
  submissionLines: [],
  unsavedChanges: false,
  fullscreen: false,
  workspaceLoaded: false,
  workspaceLoading: false,
  workspaceMode: 'starter',
  workspaceAssessmentKey: 'main-exam',
  workspaceError: ''
};

function normalizeWorkspaceRequest(workspaceRequest = 'starter', maybeMode) {
  if (typeof workspaceRequest === 'string') {
    return {
      assessmentKey: maybeMode ? workspaceRequest : null,
      mode: maybeMode || workspaceRequest
    };
  }

  return {
    assessmentKey: workspaceRequest?.assessmentKey || null,
    mode: workspaceRequest?.mode || 'starter'
  };
}

const useIDEStore = create((set, get) => ({
  ...defaultState,
  setActiveFile: (id) => set({ activeFileId: id }),
  setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setOutputLines: (lines) => set({ outputLines: lines }),
  setTestLines: (lines) => set({ testLines: lines }),
  setTestSummary: (summary) => set({ testSummary: summary }),
  setTestCases: (testCases) => set({ testCases }),
  setSubmissionLines: (lines) => set({ submissionLines: lines }),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  saveChanges: () => set({ unsavedChanges: false }),
  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((file) => (file.id === id ? { ...file, content } : file)),
      unsavedChanges: true
    })),
  loadWorkspace: async (workspaceRequest = 'starter', maybeMode) => {
    if (get().workspaceLoading) {
      return;
    }

    const { assessmentKey: requestedAssessmentKey, mode } = normalizeWorkspaceRequest(workspaceRequest, maybeMode);
    const assessmentKey = requestedAssessmentKey || get().workspaceAssessmentKey || 'main-exam';

    set({ workspaceLoading: true, workspaceError: '' });

    const files = fallbackWorkspaceFiles.map((file) => ({
      ...file,
      readOnly: file.readOnly ?? false
    }));
    const firstFileId = getDefaultFileId(files, get().activeFileId);

    set({
      files,
      originalFiles: files,
      activeFileId: firstFileId,
      workspaceLoaded: true,
      workspaceLoading: false,
      workspaceMode: mode,
      workspaceAssessmentKey: assessmentKey,
      workspaceError: '',
      unsavedChanges: false,
      testSummary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: null },
      testCases: []
    });
  },
  resetEditor: async () => {
    if (get().workspaceLoading) {
      return;
    }

    const assessmentKey = get().workspaceAssessmentKey || 'main-exam';

    set({ workspaceLoading: true, workspaceError: '' });

    const files = fallbackWorkspaceFiles.map((file) => ({
      ...file,
      readOnly: file.readOnly ?? false
    }));
    const firstFileId = getDefaultFileId(files);

    set({
      files,
      originalFiles: files,
      activeFileId: firstFileId,
      workspaceLoaded: true,
      workspaceLoading: false,
      workspaceMode: 'starter',
      workspaceAssessmentKey: assessmentKey,
      unsavedChanges: false,
      activeOutputTab: 'output',
      activeRightTab: 'problem',
      outputLines: ['Editor reset to fallback workspace files.'],
      testLines: ['Test runner is ready.'],
      submissionLines: [],
      workspaceError: '',
      testSummary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: null },
      testCases: []
    });
  },
  refreshFiles: async () => {
    await get().loadWorkspace({ assessmentKey: get().workspaceAssessmentKey || 'main-exam', mode: get().workspaceMode || 'starter' });
    set({ outputLines: ['File tree refreshed.'], unsavedChanges: false });
  }
}));

export default useIDEStore;
