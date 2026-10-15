import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import GradePicker from './components/GradePicker';
import UnitExplorer from './components/UnitExplorer';
import AssessmentGallery from './components/AssessmentGallery';
import Footer from './components/Footer';
import Toast from './components/Toast';
import useContent from './lib/useContent';

// 주소창의 #grade-2 같은 해시로 학년을 바로 열 수 있어요.
const gradeFromHash = () => Number((window.location.hash.match(/^#grade-(\d)/) || [])[1]) || 1;

export default function App() {
  const { content, live } = useContent();
  const [grade, setGrade] = useState(gradeFromHash);
  const [semester, setSemester] = useState('1');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const notify = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  const scrollToUnits = () => document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' });

  const pickGrade = (g) => {
    setGrade(g);
    history.replaceState(null, '', `#grade-${g}`);
    requestAnimationFrame(scrollToUnits);
  };

  useEffect(() => {
    if (/^#grade-\d/.test(window.location.hash)) setTimeout(scrollToUnits, 300);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header {...content.site} onStart={() => document.getElementById('grades')?.scrollIntoView({ behavior: 'smooth' })} />
      <main>
        <GradePicker grades={content.grades} current={grade} onPick={pickGrade} />
        <UnitExplorer
          grades={content.grades}
          grade={grade}
          semester={semester}
          onGrade={(g) => {
            setGrade(g);
            history.replaceState(null, '', `#grade-${g}`);
          }}
          onSemester={setSemester}
          notify={notify}
        />
        <AssessmentGallery items={content.assessments} grades={content.grades} />
      </main>
      <Footer title={content.site.title} terms={content.terms} live={live} />
      <Toast message={toast} />
    </div>
  );
}
