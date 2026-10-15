import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Images, Users, User } from 'lucide-react';
import { studentWorks } from '../data/mockData';
import SectionTitle from './SectionTitle';

const TABS = [
  { value: 0, label: '전체보기', color: 'bg-black text-white' },
  { value: 1, label: '1학년 🌱', color: 'bg-mint' },
  { value: 2, label: '2학년 🌿', color: 'bg-candy' },
  { value: 3, label: '3학년 🌳', color: 'bg-lavender text-white' },
];
const GRADE_BADGE = { 1: 'bg-mint', 2: 'bg-candy', 3: 'bg-lavender text-white' };

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
      className={`relative flex items-center gap-1.5 rounded-full border-[3px] border-black px-3 py-1 font-jua shadow-retro-sm transition-colors ${
        liked ? 'bg-coral text-white' : 'bg-white'
      }`}
    >
      <motion.span key={burst} animate={burst ? { scale: [1, 1.6, 1] } : {}} transition={{ duration: 0.35 }}>
        <Heart size={18} strokeWidth={2.5} fill={liked ? '#fff' : 'none'} />
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
            ❤️
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function Gallery() {
  const [grade, setGrade] = useState(0);
  const [likes, setLikes] = useState(() => Object.fromEntries(studentWorks.map((w) => [w.id, w.likes])));
  const [liked, setLiked] = useState({});
  const list = useMemo(() => (grade ? studentWorks.filter((w) => w.grade === grade) : studentWorks), [grade]);

  const like = (id) => {
    setLikes((l) => ({ ...l, [id]: l[id] + 1 }));
    setLiked((s) => ({ ...s, [id]: true }));
  };

  return (
    <section id="jarang" className="scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          tag="SECTION 3 · 자랑터"
          tagColor="bg-mint"
          icon={Images}
          title="학생 활동 결과물 갤러리 🖼️"
          desc="1·2·3학년 친구들이 질문하며 만든 멋진 작품들이에요. 마음에 드는 작품에 하트를 꾹꾹 눌러 응원해 주세요!"
        />

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="학년 필터">
          {TABS.map((t) => {
            const on = grade === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={on}
                onClick={() => setGrade(t.value)}
                className={`rounded-xl border-[3px] border-black px-4 py-1.5 font-jua transition-all ${
                  on ? `${t.color} translate-y-1 shadow-retro-sm` : 'bg-white shadow-retro hover:translate-y-0.5'
                }`}
              >
                [{t.label}]
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((w, i) => (
              <motion.article
                layout
                key={w.id}
                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="flex flex-col rounded-2xl border-[3px] border-black bg-white p-3 shadow-retro transition-[transform,box-shadow] duration-150 hover:translate-y-1 hover:shadow-retro-sm"
              >
                {/* 일러스트 플레이스홀더 */}
                <div
                  className="pixel-patch relative grid aspect-[16/9] sm:aspect-[4/3] place-items-center overflow-hidden rounded-xl border-[3px] border-black"
                  style={{ backgroundColor: w.bg }}
                >
                  <span className="absolute left-2 top-2 h-6 w-14 -rotate-12 border-2 border-black/30 bg-white/60" aria-hidden />
                  <motion.span className="text-7xl drop-shadow-[3px_3px_0_#000]" whileHover={{ scale: 1.15, rotate: 8 }}>
                    {w.emoji}
                  </motion.span>
                  <span className="absolute bottom-2 right-2 rounded-md border-2 border-black bg-white px-2 text-xs font-bold">{w.type}</span>
                </div>

                <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                  <span className={`retro-chip mb-2 w-fit ${GRADE_BADGE[w.grade]}`}>{w.className}</span>
                  <h3 className="text-xl leading-snug">{w.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-black/70">
                    {w.author.includes('모둠') || w.author.includes('단') || w.author.includes('팀') ? <Users size={14} /> : <User size={14} />}
                    {w.author}
                  </p>
                  <div className="relative mb-4 mt-4 rounded-xl border-2 border-black bg-cream p-3 text-sm">
                    <span className="absolute -top-3 left-3 rounded-full border-2 border-black bg-butter px-2 text-xs font-bold">하연샘의 칭찬 🌟</span>
                    “{w.praise}”
                  </div>
                  <div className="mt-auto flex justify-end">
                    <LikeButton count={likes[w.id]} liked={!!liked[w.id]} onClick={() => like(w.id)} />
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
