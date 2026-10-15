import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Heart, Image as ImageIcon, Link2, Paperclip, Pencil, Presentation, Table, Trophy, Upload } from 'lucide-react';
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

export default function AssessmentGallery({ items, grades }) {
  const [kind, setKind] = useState('all');
  const [grade, setGrade] = useState(0);
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});

  const gradeItems = useMemo(
    () => [{ value: 0, label: '모든 학년', tone: 'bg-butter' }, ...grades.map((g) => ({ value: g.grade, label: g.label, tone: TONE[g.color].bg }))],
    [grades]
  );
  const list = useMemo(
    () => items.filter((w) => (kind === 'all' || w.kind === kind) && (!grade || w.grade === grade)),
    [items, kind, grade]
  );

  const like = (w) => {
    if (liked[w.id]) return;
    setLikes((l) => ({ ...l, [w.id]: (l[w.id] ?? w.likes) + 1 }));
    setLiked((s) => ({ ...s, [w.id]: true }));
    sendLike(w.id);
  };

  return (
    <section id="assessment" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          no={3}
          tag="수행평가 전시관"
          tone="bg-mint"
          title="수행평가 과정물 & 결과물 🖼️"
          desc="완성작만큼 그 과정도 소중해요. 생각을 키워 온 과정물과 멋진 결과물을 함께 걸어 두었어요."
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <Filter items={KINDS} value={kind} onChange={setKind} label="자료 종류" id="kindPill" />
            <Filter items={gradeItems} value={grade} onChange={setGrade} label="학년" id="galleryGradePill" />
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
            {list.map((w, i) => {
              const t = TONE[w.color] || TONE.sky;
              const k = KIND_LABEL[w.kind];
              return (
                <motion.article
                  layout
                  key={w.id}
                  initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="card flex flex-col p-3 transition-transform duration-150 hover:-translate-y-1"
                >
                  {/* 폴라로이드 사진 자리: 실제 이미지가 생기면 image 필드로 바꿔 넣어요 */}
                  <div className={`dots relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border-2 border-ink ${t.bg}`}>
                    <span className="absolute left-1/2 top-1 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-white/70" aria-hidden />
                    {w.image ? (
                      <img src={w.image} alt={w.title} className="h-full w-full object-cover" />
                    ) : (
                      <motion.span className="text-7xl drop-shadow-[3px_3px_0_#3D3552]" whileHover={{ scale: 1.15, rotate: 8 }}>
                        {w.emoji}
                      </motion.span>
                    )}
                    <span className={`chip absolute bottom-2 left-2 ${k.tone}`}>{k.text}</span>
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                    <span className="text-xs font-bold text-ink/80">
                      {w.grade}학년 {w.semester}학기 · {w.unit}
                    </span>
                    <h3 className="mt-1 text-xl leading-snug">{w.title}</h3>
                    <p className="mt-1 text-sm text-ink/80">{w.desc}</p>
                    {w.files?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {w.files.map((f) => {
                          const meta = FILE_TYPE[f.type] || FILE_TYPE.link;
                          const Icon = meta.icon;
                          return (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1 font-jua text-sm shadow-pop-sm transition-transform hover:-translate-y-0.5 ${meta.tone}`}
                            >
                              <Icon size={14} strokeWidth={2.5} /> {f.label || meta.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-jua text-base text-ink/80">{w.author}</span>
                      <LikeButton count={likes[w.id] ?? w.likes} liked={!!liked[w.id]} onClick={() => like(w)} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && <p className="card mt-2 border-dashed p-8 text-center font-jua text-xl text-ink/80">아직 올라온 작품이 없어요. 곧 채워질 거예요!</p>}
      </div>
    </section>
  );
}
