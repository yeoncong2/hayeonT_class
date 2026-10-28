import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import GradePicker from './components/GradePicker';
import UnitExplorer from './components/UnitExplorer';
import AssessmentGallery from './components/AssessmentGallery';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AdminPanel from './components/AdminPanel';
import useContent from './lib/useContent';

// 주소창의 #grade-2 같은 해시로 학년을 바로 열 수 있어요.
const gradeFromHash = () => Number((window.location.hash.match(/^#grade-(\d)/) || [])[1]) || 1;

export default function App() {
  const [admin, setAdmin] = useState(window.location.hash === '#admin');
  useEffect(() => {
    const on = () => setAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return admin ? <AdminPanel /> : <Site />;
}

function Site() {
  const { content, live } = useContent();
  const [grade, setGrade] = useState(gradeFromHash);
  const [semester, setSemester] = useState('1');
  const [openNo, setOpenNo] = useState(null);
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

  // 수행평가 카드의 관련 단원을 누르면 그 단원 창을 바로 열어 줘요.
  const showUnit = (g, ref) => {
    setGrade(g);
    history.replaceState(null, '', `#grade-${g}`);
    if (ref?.semester) {
      setSemester(String(ref.semester));
      setOpenNo(ref.no);
    }
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
          openNo={openNo}
          onOpen={setOpenNo}
          notify={notify}
        />
        <AssessmentGallery tasks={content.tasks} grades={content.grades} onUnit={showUnit} />
      </main>
      <Footer title={content.site.title} questions={content.questions} live={live} />
      <Toast message={toast} />
    </div>
  );
}
