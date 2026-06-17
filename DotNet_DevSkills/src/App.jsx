import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AssessmentLandingPage from './pages/AssessmentLandingPage';
import TaskSelectionPage from './pages/TaskSelectionPage';
import AssessmentPage from './pages/AssessmentPage';
import CodingIDEPage from './pages/CodingIDEPage';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = window.localStorage.getItem('devskills-theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('devskills-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));

  const themeClasses = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';

  return (
    <div className={`min-h-screen ${themeClasses}`}>
      <Routes>
        <Route path="/" element={<AssessmentLandingPage theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/task-selection" element={<TaskSelectionPage theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/assessment" element={<AssessmentPage theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/ide" element={<CodingIDEPage theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
