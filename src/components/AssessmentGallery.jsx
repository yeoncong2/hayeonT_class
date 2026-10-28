import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ExternalLink, FileText, Hourglass, Image as ImageIcon, Link2, Paperclip, Presentation, Table, Trophy } from 'lucide-react';
import { TONE } from '../lib/colors';
import SectionTitle from './SectionTitle';

export const FILE_TYPE = {
  pdf: { label: 'PDF 보기', icon: FileText, tone: 'bg-pink' },
  sheet: { label: '구글 시트', icon: Table, tone: 'bg-mint' },
  doc: { label: '문서 보기', icon: FileText, tone: 'bg-sky' },
  slide: { label: '슬라이드', icon: Presentation, tone: 'bg-butter' },
  image: { label: '사진 보기', icon: ImageIcon, tone: 'bg-lilac' },
  link: { label: '링크 열기', icon: Link2, tone: 'bg-white' },
  file: { label: '파일 받기', icon: Paperclip, tone: 'bg-white' },
};

function Filter({ items, value, onChange, label, id }) {
  return (
    <div className="flex flex-wrap rounded-full border-2 border-ink bg-white p-1 shadow-pop-sm" role="tablist" aria-label={label}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button key={it.value} role="tab" aria-selected={on} onClick={() => onChange(it.value)} className="relative rounded-full px-3 py-1 font-jua text-sm sm:text-base">
            {on && <motion.span layoutId={id} className={`absolute inset-0 rounded-full border-2 border-ink ${it.tone}`} />}
            <span className="relative">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// 관련 단원 표시: 교과서 단원이 정해진 것은 눌러서 그 단원 창으로 바로 가요.
const unitText = (ref) => ref.label || `${ref.semester}학기 ${ref.no}단원 · ${ref.lesson}`;

// 결과물 주소를 보고 어느 사이트로 가는지 알려 줘요.
const siteName = (url) => {
  if (/padlet/i.test(url)) return '패들릿';
  if (/quizn/i.test(url)) return '퀴즈앤';
  return '바로 가기';
};

// 수행평가마다 결과물 칸 하나. content.json 의 url 에 퀴즈앤·패들릿 주소를 넣으면 새 탭으로 열려요.
function ResultSlot({ url }) {
  const link = url?.trim();
  if (!link) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/50 bg-white/70 px-3 py-3 text-center">
        <Hourglass size={16} strokeWidth={2.5} className="text-ink/60" />
        <span className="font-jua text-ink">결과물</span>
        <span className="text-sm text-ink/70">링크 준비 중이에요</span>
      </div>
    );
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-pink px-3 py-3 font-jua text-lg shadow-pop-sm transition-transform hover:-translate-y-0.5"
    >
      <Trophy size={18} strokeWidth={2.5} /> 결과물
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-xs">
        {siteName(link)} <ExternalLink size={12} strokeWidth={2.5} />
      </span>
    </a>
  );
}

export default function AssessmentGallery({ tasks, grades, onUnit }) {
  const [grade, setGrade] = useState(0);

  const gradeItems = useMemo(
    () => [{ value: 0, label: '모든 학년', tone: 'bg-butter' }, ...grades.map((g) => ({ value: g.grade, label: g.label, tone: TONE[g.color].bg }))],
    [grades]
  );
  const list = useMemo(() => tasks.filter((t) => !grade || t.grade === grade), [tasks, grade]);

  return (
    <section id="assessment" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          no={3}
          tag="수행평가 전시관"
          tone="bg-mint"
          title="학년별 수행평가 🖼️"
          desc="학년마다 세 가지 수행평가를 해요. 관련 단원을 누르면 그 단원 자료로 바로 갈 수 있고, 결과물 칸을 누르면 결과물을 올리고 친구들 작품도 볼 수 있는 곳이 열려요."
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <Filter items={gradeItems} value={grade} onChange={setGrade} label="학년" id="galleryGradePill" />
          </div>
        </SectionTitle>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((t, i) => {
              const tone = TONE[t.color] || TONE.sky;
              const g = grades.find((x) => x.grade === t.grade);
              const order = tasks.filter((x) => x.grade === t.grade).indexOf(t) + 1;
              return (
                <motion.article
                  layout
                  key={t.id}
                  initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="card flex flex-col p-3"
                >
                  <div className={`dots relative grid aspect-[16/9] place-items-center overflow-hidden rounded-2xl border-2 border-ink ${tone.bg}`}>
                    <span className="absolute left-1/2 top-1 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-white/70" aria-hidden />
                    <motion.span className="text-6xl drop-shadow-[3px_3px_0_#3D3552]" whileHover={{ scale: 1.15, rotate: 8 }}>
                      {t.emoji}
                    </motion.span>
                    <span className={`chip absolute bottom-2 left-2 ${TONE[g?.color]?.bg || 'bg-white'}`}>
                      {t.grade}학년 수행평가 {order}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                    <h3 className="text-xl leading-snug">{t.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-ink/80">관련 단원</span>
                      {t.units.map((ref) =>
                        ref.semester ? (
                          <button key={unitText(ref)} onClick={() => onUnit(t.grade, ref)} className="chip bg-white transition-colors hover:bg-butter" title="이 단원 자료 열기">
                            📖 {unitText(ref)} <ChevronRight size={12} strokeWidth={3} />
                          </button>
                        ) : (
                          <span key={unitText(ref)} className="chip bg-cream">
                            {unitText(ref)}
                          </span>
                        )
                      )}
                    </div>
                    <p className="mt-2 text-sm text-ink/80">{t.desc}</p>
                    <div className="mt-auto pt-4">
                      <ResultSlot url={t.url} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
