# Multi-File .NET Coding IDE Architecture

## Executive Summary

This document outlines the refactored architecture for a React-based .NET Coding IDE that supports complete multi-file .NET projects while remaining 100% deployable to SharePoint without server infrastructure.

**Key Design Principles:**
- ✅ Zero server dependency (static React + SharePoint)
- ✅ Complete project structure preservation (no flattening)
- ✅ Browser-based ZIP generation (jszip)
- ✅ Judge0 multi-file submission (language_id 89)
- ✅ Dynamic question loading from static assets
- ✅ In-memory project state management
- ✅ Real-time file editing with full project context

---

## 1. Folder Structure

### Current Structure
```
public/
  MainCode/              [Single question, starter mode]
  MainCode-Sol/          [Single question, solution mode]
  testToday-main/        [Single question, starter mode]
  testToday-main - Sol/  [Single question, solution mode]
```

### New Structure
```
public/questions/
  q1-course-management/          [Question 1]
    starter/
      HON.Academy.sln
      HON.Academy.DAL/
        HON.Academy.DAL.csproj
        bin/
        obj/
        Models/
        Services/
        Migrations/
        DataTransferObject/
        Data/
      HON.Academy.Web/
      HON.Academy.XunitTests/
    solution/
      [Same structure with complete implementations]
  
  q2-inventory-system/           [Question 2]
    starter/
    solution/
  
  [... 40 more questions ...]
  
  q42-final-project/
    starter/
    solution/
```

### Metadata
```
data/
  assessmentMeta.json            [Maps questions to folders]
```

**assessmentMeta.json structure:**
```json
{
  "codeEditor": {
    "defaultAssessmentKey": "q1-course-management",
    "assessments": [
      {
        "key": "q1-course-management",
        "label": "Course Management System",
        "difficulty": "Medium",
        "timeLimit": 120,
        "starterRoot": "public/questions/q1-course-management/starter",
        "solutionRoot": "public/questions/q1-course-management/solution",
        ...
      },
      ...
    ]
  }
}
```

---

## 2. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Application                            │
│                   (SharePoint Hosted)                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │    Question Selector Dropdown         │
        │  (loads from assessmentMeta.json)     │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   WorkspaceLoader.js                  │
        │  • Fetch question files from          │
        │    /public/questions/qN/starter       │
        │  • Parse folder structure             │
        │  • Create file objects                │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ProjectTreeBuilder.js               │
        │  • Build hierarchical tree from       │
        │    flat file list                     │
        │  • Categorize files (Models,          │
        │    Services, Tests, etc.)             │
        │  • Store in React state               │
        └───────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    [FileExplorer]    [MonacoEditor]    [ConsolePanel]
     (Display Tree)    (Edit File)       (Show Output)
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │    User Edits Files (in memory)       │
        │  • updateFileContent() tracks changes │
        │  • Project tree stays in sync         │
        │  • No disk writes needed              │
        └───────────────────────────────────────┘
                            │
          [Build & Run] ◄───┤───► [Submit] ◄───► [Get Solution]
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   ZipGenerator.js                     │
        │  • Collect project files from state   │
        │  • Generate compile.sh (dotnet build) │
        │  • Generate run.sh (dotnet test)      │
        │  • Create ZIP in-memory (jszip)       │
        │  • Encode ZIP as Base64               │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Judge0Integration.js                │
        │  • Submit with language_id: 89        │
        │  • Additional_files: <base64_zip>     │
        │  • Poll submission status             │
        │  • Parse test results                 │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Display Results in Console          │
        │  • Compilation errors                 │
        │  • Test pass/fail                     │
        │  • Exit codes & output                │
        └───────────────────────────────────────┘
```

---

## 3. Service Layer

### A. ProjectTreeBuilder.js
**Purpose:** Build hierarchical project structure from flat file array

```javascript
// Input: Array of files with paths
[
  { id: '1', path: 'HON.Academy.DAL/Models/Course.cs', content: '...' },
  { id: '2', path: 'HON.Academy.DAL/Services/CourseService.cs', content: '...' },
  ...
]

// Output: Hierarchical tree
{
  name: 'root',
  children: [
    {
      name: 'HON.Academy.DAL',
      type: 'folder',
      children: [
        {
          name: 'Models',
          type: 'folder',
          children: [
            {
              name: 'Course.cs',
              type: 'file',
              fileId: '1',
              content: '...'
            }
          ]
        },
        {
          name: 'Services',
          type: 'folder',
          children: [...]
        }
      ]
    }
  ]
}
```

**Key Functions:**
- `buildProjectTree(files)` - Create hierarchical structure
- `flattenTree(tree)` - Convert tree back to flat array for state
- `findFile(tree, path)` - Locate file in tree
- `insertFile(tree, path, fileData)` - Add file to tree
- `deleteFile(tree, path)` - Remove file from tree

---

### B. ZipGenerator.js
**Purpose:** Create ZIP files from project structure in browser memory

```javascript
// Input: Project files from React state
const projectFiles = [
  { path: 'HON.Academy.sln', content: '...' },
  { path: 'HON.Academy.DAL/DAL.csproj', content: '...' },
  { path: 'HON.Academy.DAL/Models/Course.cs', content: '...' },
  ...
]

// Output: Base64-encoded ZIP
"UEsDBAoAAAAAABABFVYAAAAAAAAAAAAAAAAVAAAASE9OLkFjYWRlbXkuREFML01vZGVscy9Db3Jz..."
```

**Key Functions:**
- `createProjectZip(files)` - Generate ZIP from files array
- `addScriptsToZip(zip, scriptType)` - Add compile.sh/run.sh
- `generateCompileScript()` - Create compile.sh
- `generateRunScript()` - Create run.sh
- `encodeZipAsBase64(zip)` - Convert ZIP to Base64

**Scripts Generated:**

compile.sh:
```bash
#!/bin/bash
set -e
dotnet restore
dotnet build --no-restore --configuration Release
```

run.sh:
```bash
#!/bin/bash
set -e
dotnet test --no-build --configuration Release --logger "console;verbosity=detailed"
```

---

### C. Judge0Integration.js
**Purpose:** Communicate with Judge0 API for multi-file submissions

```javascript
// Input: Base64-encoded ZIP + metadata
{
  language_id: 89,
  additional_files: "UEsDBAoAAAAAABABFVYAAAAAAAAAAAAAAAAVAAAASE9OLkFjYWRlbXku...",
  compile_cmd: "bash compile.sh",
  run_cmd: "bash run.sh",
  cpu_time_limit: 10,
  memory_limit: 512000
}

// Output: Test results + status
{
  success: true,
  compilation_status: "OK",
  test_results: [
    { name: 'TestCourse1', passed: true, duration: 150 },
    { name: 'TestCourse2', passed: false, message: 'AssertionError' }
  ],
  output: "Test run output...",
  exitCode: 0
}
```

**Key Functions:**
- `submitProjectToJudge0(zipBase64)` - Send submission
- `pollSubmissionStatus(tokenId)` - Check status via polling
- `parseTestResults(output)` - Extract test pass/fail from output
- `normalizeJudge0Payload(response)` - Format response for UI

**Judge0 Submission Format:**
```json
{
  "language_id": 89,
  "additional_files": "<base64_zip>",
  "compile_cmd": "bash compile.sh",
  "run_cmd": "bash run.sh",
  "cpu_time_limit": 10,
  "memory_limit": 512000,
  "redirect_stderr_to_stdout": true
}
```

---

## 4. State Management (Zustand)

### Extended useIDEStore.jsx

```javascript
// Project-specific state
{
  // Files & Structure
  files: [],                          // All files with content
  originalFiles: [],                  // Pristine starter files
  projectTree: {},                    // Hierarchical structure
  activeFileId: null,                 // Currently open file

  // Project Metadata
  activeProject: {                    // Current question
    key: 'q1-course-management',
    title: 'Course Management System',
    difficulty: 'Medium'
  },

  // Edit Tracking
  unsavedChanges: false,
  modifiedFiles: new Map(),           // Track which files changed

  // Build & Test State
  buildInProgress: false,
  testResults: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []                         // Individual test results
  },

  // Output
  activeOutputTab: 'output',          // 'output' | 'tests' | 'submission'
  outputLines: [],
  testLines: [],
  submissionLines: [],
  compilationOutput: '',
  compilationErrors: []
}
```

**New Actions:**
- `buildProjectTree(files)` - Create tree structure
- `submitToJudge0(files)` - Create ZIP + submit
- `updateTestResults(results)` - Update build/test state
- `trackFileModification(fileId)` - Mark file as edited
- `loadQuestion(questionKey, mode)` - Load new question

---

## 5. Modified Services

### WorkspaceLoader.js - New Implementation

```javascript
async function loadWorkspaceFiles(questionKey, mode) {
  // 1. Fetch assessmentMeta.json
  const meta = await fetchAssessmentMeta();
  
  // 2. Find question config
  const questionConfig = meta.codeEditor.assessments.find(
    a => a.key === questionKey
  );
  
  // 3. Determine root folder
  const root = mode === 'solution' 
    ? questionConfig.solutionRoot 
    : questionConfig.starterRoot;
  
  // 4. Fetch file manifest
  const manifest = await fetch(`${root}/manifest.json`).then(r => r.json());
  
  // 5. Load all files in parallel
  const files = await Promise.all(
    manifest.files.map(async (filePath) => {
      const content = await fetch(`${root}/${filePath}`).then(r => r.text());
      return {
        id: generateId(),
        path: filePath,
        name: filePath.split('/').pop(),
        content,
        readOnly: false
      };
    })
  );
  
  return files;
}
```

### New: BuildRunner.js

```javascript
async function buildAndRunTests(files, questionKey) {
  try {
    // 1. Create ZIP from project files
    const zipBase64 = await createProjectZip(files);
    
    // 2. Submit to Judge0
    const submission = await submitToJudge0({
      languageId: 89,
      additionalFiles: zipBase64
    });
    
    // 3. Poll for results
    const results = await pollJudge0Results(submission.token);
    
    // 4. Parse results
    const parsed = parseTestResults(results.output);
    
    return {
      success: results.status === 'Accepted',
      compilation: parsed.compilation,
      tests: parsed.tests,
      output: results.output,
      exitCode: results.exit_code
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: ''
    };
  }
}
```

---

## 6. React Component Changes

### CodingIDEPage.jsx - Build & Run Handler

**Before (Current):**
```javascript
const handleBuildAndRunTests = async () => {
  // Flattens project to single C# file
  const { sourceCode } = flattenCSharpProject(files);
  const result = await runCodeWithJudge0({ 
    sourceCode, 
    languageId: 51  // C# single-file
  });
  // Display results
}
```

**After (New):**
```javascript
const handleBuildAndRunTests = async () => {
  setActiveOutputTab('output');
  setOutputLines(['Creating project ZIP...']);
  
  try {
    // 1. Generate ZIP from project files
    const zipBase64 = await createProjectZip(files);
    
    // 2. Display progress
    setOutputLines(['Submitting to Judge0 (multi-file mode)...']);
    
    // 3. Submit to Judge0 with multi-file support
    const result = await submitProjectToJudge0({
      languageId: 89,
      additionalFiles: zipBase64
    });
    
    // 4. Parse and display results
    const parsed = parseTestResults(result.output);
    setTestLines(formatTestOutput(parsed));
    setOutputLines(result.output.split('\n'));
    
  } catch (error) {
    setOutputLines([`Error: ${error.message}`]);
  }
}
```

---

## 7. File Manifest Pattern

Each question folder contains `manifest.json`:

```json
{
  "version": 1,
  "projectName": "HON.Academy",
  "files": [
    "HON.Academy.sln",
    "HON.Academy.DAL/HON.Academy.DAL.csproj",
    "HON.Academy.DAL/Models/Course.cs",
    "HON.Academy.DAL/Models/Student.cs",
    "HON.Academy.DAL/Services/CourseService.cs",
    "HON.Academy.DAL/Migrations/001_Initial.cs",
    "HON.Academy.Web/HON.Academy.Web.csproj",
    "HON.Academy.Web/Controllers/CourseController.cs",
    "HON.Academy.XunitTests/CourseServiceTests.cs"
  ]
}
```

---

## 8. Implementation Timeline

### Phase 1: Infrastructure (2-3 hours)
1. Install jszip dependency
2. Create ProjectTreeBuilder.js
3. Create ZipGenerator.js
4. Create Judge0Integration.js

### Phase 2: Storage Layer (2-3 hours)
1. Design new folder structure
2. Create manifest.json format
3. Modify WorkspaceLoader.js
4. Update assessmentMeta.json

### Phase 3: State & Integration (2-3 hours)
1. Extend useIDEStore.jsx
2. Create BuildRunner.js
3. Wire up Judge0 polling
4. Implement test result parsing

### Phase 4: UI Integration (1-2 hours)
1. Modify CodingIDEPage.jsx
2. Update Build & Run handler
3. Add progress indicators
4. Format console output

### Phase 5: Testing & Deployment (2-3 hours)
1. Test with sample questions
2. Verify Judge0 submission
3. SharePoint deployment validation
4. Browser ZIP generation verification

---

## 9. NPM Dependencies

### New Dependencies
```json
{
  "jszip": "^3.10.1",           // ZIP generation in browser
  "base64-js": "^1.5.1"         // Base64 encoding/decoding
}
```

### Installation
```bash
npm install jszip base64-js
```

---

## 10. Judge0 Configuration

### API Endpoint
```
POST https://ce.judge0.com/submissions?base64_encoded=false&wait=true
```

### Multi-File Submission
```json
{
  "language_id": 89,
  "additional_files": "<base64_encoded_zip>",
  "compile_cmd": "bash compile.sh",
  "run_cmd": "bash run.sh",
  "cpu_time_limit": 10,
  "memory_limit": 512000,
  "redirect_stderr_to_stdout": true
}
```

### Test Result Parsing
```
xUnit test output format:
Test session starts on Sun Jan 1 00:00:00 2024
Platform: Linux

  CourseServiceTests.TestGetCourses PASSED
  CourseServiceTests.TestAddCourse FAILED
    AssertionError: Expected 10, but got 9

Test execution completed

Total Tests: 2
Passed: 1
Failed: 1
```

---

## 11. Error Handling & Fallback

### Scenarios
1. **Judge0 Unavailable** → Display user message
2. **Network Error** → Retry with exponential backoff
3. **ZIP Creation Failed** → Show detailed error
4. **Large Project** → Warn about file size
5. **Timeout** → Set reasonable limit (10s)

### Graceful Degradation
```javascript
if (judge0Unavailable) {
  displayMessage('Judge0 service unavailable. Please try again.');
  // Could fall back to single-file mode with warning
}
```

---

## 12. Performance Considerations

### Optimization Strategies
1. **Lazy Load Questions** - Don't fetch all questions at startup
2. **Memoize Project Tree** - Cache tree construction
3. **Debounce File Updates** - Batch multiple edits
4. **Compress ZIP** - Use jszip compression
5. **Streaming Upload** - For very large projects

### Benchmarks
- Small project ZIP (~100 files): ~50ms
- Medium project ZIP (~300 files): ~150ms
- Large project ZIP (~1000 files): ~500ms
- Base64 encoding: ~2x ZIP size
- Judge0 submission: 2-5 seconds

---

## 13. Deployment Checklist

- [ ] Install jszip dependency
- [ ] Create all new services
- [ ] Update WorkspaceLoader.js
- [ ] Extend useIDEStore.jsx
- [ ] Modify CodingIDEPage.jsx
- [ ] Create /public/questions/ structure
- [ ] Generate manifest.json for each question
- [ ] Update assessmentMeta.json
- [ ] Test all 42 questions
- [ ] Verify Judge0 API access
- [ ] Deploy to SharePoint
- [ ] Test in SharePoint environment
- [ ] Monitor Judge0 submissions
- [ ] Document for end users

---

## 14. Future Enhancements

1. **Local Storage Caching** - Cache questions for offline access
2. **Autosave with Conflict Detection** - Prevent data loss
3. **Multi-file Diff View** - Compare starter vs current
4. **Syntax Highlighting for Project Tree** - File type icons
5. **Test Coverage Reports** - Display coverage percentages
6. **Performance Profiling** - Show execution time per test
7. **Collaborative Editing** - Multi-user support (WebSocket)
8. **Version Control** - Git-like history

---

## 15. Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Components                            │
│  ┌──────────────┬───────────────┬──────────────┬──────────────┐ │
│  │ FileExplorer │ MonacoEditor  │ ConsolePanel │  AssessmentDetails │
│  └──────────────┴───────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  State Management (Zustand)                     │
│  useIDEStore: files, projectTree, testResults, outputLines      │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ WorkspaceLoader  │ │ProjectTreeBuilder│ │FileExplorer      │
│                  │ │                  │ │(display tree)    │
│ Load questions   │ │ Build hierarchy  │ │                  │
│ from static      │ │ from flat array  │ │                  │
│ assets           │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                           │
        ┌──────────────────┼──────────────────────────┐
        │                  │                          │
        ▼                  ▼                          ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ZipGenerator     │ │BuildRunner       │ │ScriptGenerator   │
│                  │ │                  │ │                  │
│ Create ZIP from  │ │ Orchestrate      │ │ Generate         │
│ project files    │ │ build/test flow  │ │ compile.sh       │
│ Compress & encode│ │                  │ │ run.sh           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │  Judge0Integration           │
                │                              │
                │  Submit multi-file project   │
                │  language_id: 89             │
                │  Poll results                │
                │  Parse test output           │
                └──────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Judge0 API      │
                  │  ce.judge0.com   │
                  └──────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Console Panel   │
                  │  Display results │
                  └──────────────────┘
```

---

## 16. Code Examples

### Example: Loading a Question

```javascript
// User selects question from dropdown
const handleQuestionChange = async (questionKey) => {
  setActiveOutputTab('output');
  setOutputLines(['Loading question files...']);
  
  try {
    // 1. Load workspace files from /public/questions/qN/starter/
    const files = await loadWorkspaceFiles(questionKey, 'starter');
    
    // 2. Build project tree
    const tree = buildProjectTree(files);
    
    // 3. Store in state
    setFiles(files);
    setProjectTree(tree);
    
    // 4. Set active file to first editable file
    const firstFile = files.find(f => !f.readOnly && f.name.endsWith('.cs'));
    setActiveFile(firstFile.id);
    
    setOutputLines(['Question loaded successfully.']);
  } catch (error) {
    setOutputLines([`Error: ${error.message}`]);
  }
}
```

### Example: Building & Running Tests

```javascript
const handleBuildAndRunTests = async () => {
  setActiveOutputTab('output');
  setOutputLines(['Creating project package...']);
  
  try {
    // 1. Generate compile.sh and run.sh
    const scripts = {
      'compile.sh': generateCompileScript(),
      'run.sh': generateRunScript()
    };
    
    // 2. Combine files with scripts
    const projectFiles = [
      ...files,
      { path: 'compile.sh', content: scripts['compile.sh'], readOnly: true },
      { path: 'run.sh', content: scripts['run.sh'], readOnly: true }
    ];
    
    // 3. Create ZIP
    setOutputLines(['Compressing project files...']);
    const zipBase64 = await createProjectZip(projectFiles);
    
    // 4. Submit to Judge0
    setOutputLines(['Submitting to Judge0 (multi-file mode)...']);
    const result = await submitProjectToJudge0({
      languageId: 89,
      additionalFiles: zipBase64,
      compileCmd: 'bash compile.sh',
      runCmd: 'bash run.sh'
    });
    
    // 5. Display results
    setOutputLines(result.output.split('\n'));
    
    const parsed = parseTestResults(result.output);
    setTestResults(parsed);
    
  } catch (error) {
    setOutputLines([`Build error: ${error.message}`]);
  }
}
```

---

## Summary

This architecture provides:
- **Scalability:** 42+ questions without file duplication
- **Portability:** Works on SharePoint without backend
- **Maintainability:** Clear service separation
- **Performance:** Browser-side ZIP generation
- **Reliability:** Judge0 integration with proper error handling
- **User Experience:** Real-time editing with project awareness

All code remains 100% deployable as static assets to SharePoint.
