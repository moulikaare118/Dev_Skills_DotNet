import { useEffect, useMemo, useState } from 'react';
import Timer from '../components/Timer';
import UploadSection from '../components/UploadSection';
import TimeExpiredModal from '../components/TimeExpiredModal';
import SubmissionRecordedModal from '../components/SubmissionRecordedModal';
import ThemeToggle from '../components/ThemeToggle';
import { loadAssessmentMeta } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AssessmentPage({ theme, onToggleTheme }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssessmentKey, setSelectedAssessmentKey] = useState('main-exam');
  const [starterDownloaded, setStarterDownloaded] = useState(false);
  const [assessmentMeta, setAssessmentMeta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessmentMeta().then(setAssessmentMeta).catch(() => setAssessmentMeta(null));
  }, []);

  useEffect(() => {
    if (assessmentMeta?.codeEditor?.defaultAssessmentKey) {
      setSelectedAssessmentKey(assessmentMeta.codeEditor.defaultAssessmentKey);
    }
  }, [assessmentMeta]);

  useEffect(() => {
    if (timeExpired) {
      setSubmitted(true);
      setSolutionUnlocked(true);
      setTimerActive(false);
    }
  }, [timeExpired]);

  const handleReturnHome = () => navigate('/');

  const handleSubmit = () => {
    setSubmitted(true);
    setSolutionUnlocked(true);
    setTimerActive(false);
    window.localStorage.removeItem('devskills-assessment-timer');
    setShowSubmissionModal(true);
  };

  const getAssessmentConfig = (assessmentKey) => {
    return assessmentMeta?.codeEditor?.assessments?.find((assessment) => assessment.key === assessmentKey) || null;
  };

  const getZipPath = (assessmentKey, type) => {
    const assessment = getAssessmentConfig(assessmentKey);
    if (!assessment) {
      return null;
    }

    const fileName = type === 'starter' ? assessment.starterZip : assessment.solutionZip;
    if (!fileName) {
      return null;
    }

    const baseHref = document.querySelector('base')?.href || window.location.href;
    return new URL(fileName, baseHref).href;
  };

  const downloadSolutionZip = (url) => {
    if (!url) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleGetSolution = () => {
    if (!solutionUnlocked && !timeExpired) {
      return;
    }

    const solutionZipPath = getZipPath(selectedAssessmentKey, 'solution');

    if (!solutionZipPath) {
      window.alert('Solution download is not available for this assessment.');
      return;
    }

    downloadSolutionZip(solutionZipPath);
  };

  const handleSubmissionModalClose = () => {
    setShowSubmissionModal(false);
  };

  const fileName = useMemo(() => uploadedFile?.name || 'No file uploaded yet.', [uploadedFile]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <TimeExpiredModal open={timeExpired} onClose={handleReturnHome} />
      <SubmissionRecordedModal open={showSubmissionModal} onClose={handleSubmissionModalClose} />
      <header className="mb-8 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Assessment</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">DevSkiller Coding Assessment</h1>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Candidate</p>
              <p className="mt-1 text-lg font-semibold">Alex Candidate</p>
            </div> */}
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Remaining</p>
              <div className="mt-1 flex items-center gap-2">
                <Timer active={timerActive && !timeExpired} onExpire={() => setTimeExpired(true)} />
              </div>
            </div>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            {uploadedFile && !submitted && !timeExpired ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Finish Assessment
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Instructions</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Download the starter code first, complete the HON Orders assessment locally, then upload the ZIP. Preserve TODO markers in starter files and use the latest upload as your active submission.</p>
          </section>

          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rules</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {(assessmentMeta?.assessment?.constraints || []).map((rule) => (
                <li key={rule} className="flex gap-2"><span className="font-semibold">•</span><span>{rule}</span></li>
              ))}
            </ol>
          </section>

          {/* <ProgressIndicator /> */}
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">{assessmentMeta?.assessment?.title || 'Assessment'}</h2>
            <p className="mt-4 text-slate-600">{assessmentMeta?.assessment?.description || 'Loading assessment details...'}</p>
            <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">Requirements</h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  {(assessmentMeta?.assessment?.requirements || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">Tasks</h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  {(assessmentMeta?.assessment?.tasks || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Download Base Code</h2>
                <p className="mt-2 text-sm text-slate-600">Download the starter package and use the TODO comments to complete the assessment.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedAssessmentKey}
                  onChange={(event) => {
                    setSelectedAssessmentKey(event.target.value);
                    setStarterDownloaded(false);
                  }}
                  className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
                >
                  {(assessmentMeta?.codeEditor?.assessments || []).map((assessment) => (
                    <option key={assessment.key} value={assessment.key}>{assessment.label}</option>
                  ))}
                </select>
                <a
                  href={getZipPath(selectedAssessmentKey, 'starter') || '#'}
                  download
                  onClick={() => setStarterDownloaded(true)}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Download Starter Code
                </a>
              </div>
            </div>
          </div>

          <UploadSection onFileUploaded={setUploadedFile} disabled={submitted || timeExpired || !starterDownloaded} />
          {!starterDownloaded ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Download the starter code first to enable ZIP upload.
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Solution Download</h2>
                <p className="mt-2 text-sm text-slate-600">Once you click Finish, the timer stops and Get Solution becomes available. After that, click Get Solution to download the solution ZIP for the selected assessment.</p>
              </div>
              <button
                type="button"
                onClick={handleGetSolution}
                disabled={!solutionUnlocked && !timeExpired}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                Get Solution
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Latest uploaded file: <span className="font-semibold text-slate-900">{fileName}</span></p>
            {submitted ? <p className="mt-3 text-sm text-emerald-700">Submission has been recorded.</p> : null}
            {timeExpired ? <p className="mt-3 text-sm text-rose-700">Time has expired. Upload and Get Solution actions are disabled.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
