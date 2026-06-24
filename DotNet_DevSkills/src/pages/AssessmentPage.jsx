import { useEffect, useMemo, useState } from 'react';
import Timer from '../components/Timer';
import UploadSection from '../components/UploadSection';
import BuildAndTestPanel from '../components/BuildAndTestPanel';
import ProgressIndicator from '../components/ProgressIndicator';
import TimeExpiredModal from '../components/TimeExpiredModal';
import SubmissionRecordedModal from '../components/SubmissionRecordedModal';
import ThemeToggle from '../components/ThemeToggle';
import { loadAssessmentMeta } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AssessmentPage({ theme, onToggleTheme }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [assessmentMeta, setAssessmentMeta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessmentMeta().then(setAssessmentMeta).catch(() => setAssessmentMeta(null));
  }, []);

  useEffect(() => {
    if (timeExpired) {
      setSubmitted(true);
    }
  }, [timeExpired]);

  const handleReturnHome = () => navigate('/');

  const handleSubmit = () => {
    setSubmitted(true);
    window.localStorage.removeItem('devskills-assessment-timer');
    setShowSubmissionModal(true);
  };

  const handleGetSolution = () => {
    if (timeExpired) {
      window.alert('Time is up. Solution access is now available.');
    }
  };

  const handleSubmissionModalClose = () => {
    setShowSubmissionModal(false);
    navigate('/');
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
                <Timer active={!submitted && !timeExpired} onExpire={() => setTimeExpired(true)} />
              </div>
            </div>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!uploadedFile || submitted || timeExpired}
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit Assessment
              </button>
              <button
                type="button"
                disabled={!timeExpired}
                onClick={handleGetSolution}
                className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-5 py-4 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 hover:bg-sky-400"
              >
                Get Solution
              </button>
            </div>
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
              <a
                href="/MainCode.zip"
                download
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Download Starter Code
              </a>
            </div>
          </div>

          <UploadSection onFileUploaded={setUploadedFile} disabled={submitted || timeExpired} />

          <BuildAndTestPanel uploadedFile={uploadedFile} disabled={!uploadedFile || submitted || timeExpired} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Latest uploaded file: <span className="font-semibold text-slate-900">{fileName}</span></p>
            {submitted ? <p className="mt-3 text-sm text-emerald-700">Submission has been recorded.</p> : null}
            {timeExpired ? <p className="mt-3 text-sm text-rose-700">Time has expired. Upload and build actions are disabled.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
