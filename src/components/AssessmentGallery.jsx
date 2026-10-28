import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FileText, Heart, Image as ImageIcon, Link2, Paperclip, Pencil, Presentation, Table, Trophy, Upload } from 'lucide-react';
import { TONE } from '../lib/colors';
import { sendLike } from '../lib/useContent';
import SectionTitle from './SectionTitle';

const KINDS = [
  { value: 'all', label: '전체', icon: null, tone: 'bg-white' },
  { value: 'process', label: '과정물', icon: Pencil, tone: 'bg-sky' },
  { value: 'result', label: '결과물', icon: Trophy, tone: 'bg-pink' },
];
const KIND_LABEL = { process: { text: '과정물 ✏️', tone: 'bg-sky' }, result: { text: '결과물 🏆', tone: 'bg-pink' } };

export const FILE_TYPE = {
  pdf: { label: 'PDF 보기', icon: FileText, tone: 'bg-pink' },
  sheet: { label: '구글 시트', icon: Table, tone: 'bg-mint' },
  doc: { label: '문서 보기', icon: FileText, tone: 'bg-sky' },
  slide: { label: '슬라이드', icon: Presentation, tone: 'bg-butter' },
  image: { label: '사진 보기', icon: ImageIcon, tone: 'bg-lilac' },
  link: { label: '링크 열기', icon: Link2, tone: 'bg-white' },
  file: { label: '파일 받기', icon: Paperclip, tone: 'bg-white' },
};

function LikeButton({ count, liked, onClick }) {
  const [burst, setBurst] = useState(0);
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => {
        onClick();
        setBurst((b) => b + 1);
      }}
      aria-pressed={liked}
      aria-label={`좋아요 ${count}개`}
      className={`relative flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-jua shadow-pop-sm transition-colors ${liked ? 'bg-pink-deep text-white' : 'bg-white'}`}
    >
      <motion.span key={burst} animate={burst ? { scale: [1, 1.6, 1] } : {}} transition={{ duration: 0.35 }}>
        <Heart size={16} strokeWidth={2.5} fill={liked ? '#fff' : 'none'} />
      </motion.span>
      <AnimatePresence mode="popLayout">
        <motion.span key={count} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}>
          {count}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence>
        {burst > 0 && (
          <motion.span
            key={'p' + burst}
            className="pointer-events-none absolute -top-2 left-1/2 text-lg"
            initial={{ y: 0, opacity: 1, x: '-50%' }}
            animate={{ y: -34, opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            💗
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Filter({ items, value, onChange, label, id }) {
  return (
    <div className="flex flex-wrap rounded-full border-2 border-ink bg-white p-1 shadow-pop-sm" role="tablist" aria-label={label}>
      {items.map((it) => {
        const on = it.value === value;
        const Icon = it.icon;
        return (
          <button key={it.value} role="tab" aria-selected={on} onClick={() => onChange(it.value)} className="relative rounded-full px-3 py-1 font-jua text-sm sm:text-base">
            {on && <motion.span layoutId={id} className={`absolute inset-0 rounded-full border-2 border-ink ${it.tone}`} />}
            <span className="relative inline-flex items-center gap-1">
              {Icon && <Icon size={14} strokeWidth={2.5} />} {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 관련 단원 표시: 교과서 단원이 정해진 것은 눌러서 그 단원 창으로 바로 가요.
const unitText = (ref) => ref.label || `${ref.semester}학기 ${ref.no}단원 · ${ref.lesson}`;

// 올린 작품은 학년과 단원(=수행평가 이름)이 같은 수행평가 카드 안에 들어가요.
const belongs = (w, t) => w.grade === t.grade && w.unit?.trim() === t.title;

function FileLinks({ files }) {
  if (!files?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {files.map((f) => {
        const meta = FILE_TYPE[f.type] || FILE_TYPE.link;
        const Icon = meta.icon;
        return (
          <a
            key={f.id}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 font-jua text-xs shadow-pop-sm transition-transform hover:-translate-y-0.5 ${meta.tone}`}
          >
            <Icon size={12} strokeWidth={2.5} /> {f.label || meta.label}
          </a>
        );
      })}
    </div>
  );
}

// 수행평가 카드 안의 작품 한 개
function WorkRow({ w, likes, liked, onLike }) {
  const k = KIND_LABEL[w.kind] || KIND_LABEL.result;
  return (
    <li className="rounded-xl border-2 border-ink bg-white p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={`chip ${k.tone}`}>{k.text}</span>
          <p className="mt-1 font-bold leading-snug">
            {w.emoji} {w.title}
          </p>
          {w.author && <p className="text-xs text-ink/70">{w.author}</p>}
        </div>
        <LikeButton count={likes} liked={liked} onClick={onLike} />
      </div>
      <FileLinks files={w.files} />
    </li>
  );
}

function EmptyWorks() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {['process', 'result'].map((k) => (
        <div key={k} className="grid place-items-center gap-1 rounded-xl border-2 border-dashed border-ink/50 bg-white/70 px-2 py-3 text-center text-xs text-ink/70">
          <span className="font-jua text-sm text-ink">{KIND_LABEL[k].text}</span>
          작품이 곧 올라와요
        </div>
      ))}
    </div>
  );
}

export default function AssessmentGallery({ tasks, items, grades, onUnit }) {
  const [kind, setKind] = useState('all');
  const [grade, setGrade] = useState(0);
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});

  const gradeItems = useMemo(
    () => [{ value: 0, label: '모든 학년', tone: 'bg-butter' }, ...grades.map((g) => ({ value: g.grade, label: g.label, tone: TONE[g.color].bg }))],
    [grades]
  );
  const works = useMemo(() => items.filter((w) => kind === 'all' || w.kind === kind), [items, kind]);
  const list = useMemo(() => tasks.filter((t) => !grade || t.grade === grade), [tasks, grade]);
  // 어느 수행평가에도 속하지 않는 작품(예전에 올린 것 등)은 아래에 따로 걸어요.
  const others = useMemo(() => works.filter((w) => (!grade || w.grade === grade) && !tasks.some((t) => belongs(w, t))), [works, tasks, grade]);

  const like = (w) => {
    if (liked[w.id]) return;
    setLikes((l) => ({ ...l, [w.id]: (l[w.id] ?? w.likes) + 1 }));
    setLiked((s) => ({ ...s, [w.id]: true }));
    sendLike(w.id);
  };
  const row = (w) => <WorkRow key={w.id} w={w} likes={likes[w.id] ?? w.likes} liked={!!liked[w.id]} onLike={() => like(w)} />;

  return (
    <section id="assessment" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          no={3}
          tag="수행평가 전시관"
          tone="bg-mint"
          title="학년별 수행평가 🖼️"
          desc="학년마다 세 가지 수행평가를 해요. 관련 단원을 누르면 그 단원 자료로 바로 갈 수 있고, 친구들의 과정물과 결과물도 수행평가별로 걸려요."
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <Filter items={gradeItems} value={grade} onChange={setGrade} label="학년" id="galleryGradePill" />
            <Filter items={KINDS} value={kind} onChange={setKind} label="자료 종류" id="kindPill" />
            <a
              href="#admin"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-butter px-4 py-1.5 font-jua shadow-pop-sm transition-transform hover:-translate-y-0.5"
            >
              <Upload size={16} strokeWidth={2.5} /> 과정물·결과물 올리기
            </a>
          </div>
        </SectionTitle>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((t, i) => {
              const tone = TONE[t.color] || TONE.sky;
              const g = grades.find((x) => x.grade === t.grade);
              const order = tasks.filter((x) => x.grade === t.grade).indexOf(t) + 1;
              const mine = works.filter((w) => belongs(w, t));
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
                    <div className="mt-auto pt-4">{mine.length ? <ul className="grid gap-2">{mine.map(row)}</ul> : <EmptyWorks />}</div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {others.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-2xl">그 밖의 과정물 & 결과물</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((w) => (
                <div key={w.id}>
                  <span className="mb-1 block text-xs font-bold text-ink/80">
                    {w.grade}학년 {w.semester}학기 · {w.unit}
                  </span>
                  <ul>{row(w)}</ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
