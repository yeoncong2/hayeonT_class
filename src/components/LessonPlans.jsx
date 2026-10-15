import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NotebookPen, Lightbulb, ChevronRight, Target } from 'lucide-react';
import { lessonPlans, UNIT_COLORS } from '../data/mockData';
import SectionTitle from './SectionTitle';
import Modal from './Modal';

const FILTERS = [
  { value: 0, label: '전체' },
  { value: 1, label: '1단원' },
  { value: 2, label: '2단원' },
  { value: 3, label: '3단원' },
  { value: 4, label: '4단원' },
];

const STAGES = [
  { key: 'intro', label: '도입', emoji: '🚪', color: 'bg-butter' },
  { key: 'develop', label: '전개', emoji: '🚀', color: 'bg-candy' },
  { key: 'wrap', label: '정리', emoji: '🎁', color: 'bg-mint' },
];

export default function LessonPlans() {
  const [unit, setUnit] = useState(0);
  const [selected, setSelected] = useState(null);
  const list = useMemo(() => (unit ? lessonPlans.filter((p) => p.unit === unit) : lessonPlans), [unit]);

  return (
    <section id="jihye" className="scroll-mt-20 border-y-[3px] border-black bg-[#F0FDFA] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          tag="SECTION 2 · 지혜터"
          tagColor="bg-candy"
          icon={NotebookPen}
          title="학생 활동 과정 계획서 📒"
          desc="차시별 지도 계획과 하연샘의 실전 수업 노하우를 모았어요. 카드를 누르면 도입-전개-정리 흐름을 볼 수 있어요."
        />

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="단원 필터">
          {FILTERS.map((f) => {
            const on = unit === f.value;
            const bg = f.value ? UNIT_COLORS[f.value].bg : 'bg-black text-white';
            return (
              <button
                key={f.value}
                role="tab"
                aria-selected={on}
                onClick={() => setUnit(f.value)}
                className={`rounded-xl border-[3px] border-black px-4 py-1.5 font-jua transition-all ${
                  on ? `${bg} translate-y-1 shadow-retro-sm` : 'bg-white shadow-retro hover:translate-y-0.5'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p) => {
              const c = UNIT_COLORS[p.unit];
              return (
                <motion.button
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => setSelected(p)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border-[3px] border-black bg-white text-left shadow-retro transition-[transform,box-shadow] duration-150 hover:translate-y-1 hover:shadow-retro-sm"
                >
                  {/* 노트 바인더 */}
                  <div className={`flex items-center justify-between border-b-[3px] border-black ${c.bg} px-4 py-2`}>
                    <span className="font-jua">[{p.session}]</span>
                    <span className="flex gap-1.5" aria-hidden>
                      {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-3 rounded-full border-2 border-black bg-cream" />)}
                    </span>
                  </div>
                  <div
                    className="flex flex-1 flex-col p-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #0000000d 28px)' }}
                  >
                    <h3 className="text-xl leading-snug">{p.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.badges.map((b) => (
                        <span key={b} className={`retro-chip ${c.soft}`}>#{b}</span>
                      ))}
                    </div>
                    <div className="mt-4 rounded-xl border-2 border-dashed border-black bg-butter/40 p-3 text-sm">
                      <Lightbulb size={16} className="mr-1 inline -translate-y-0.5" strokeWidth={2.5} />
                      <b>팁:</b> {p.tip}
                    </div>
                    <span className="mt-4 flex items-center gap-1 self-end font-jua text-sm text-black/70 group-hover:text-black">
                      지도안 상세보기 <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `[${selected.session}] ${selected.title}` : ''}
        icon="📒"
        headerColor={selected ? UNIT_COLORS[selected.unit].bg : 'bg-butter'}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div>
            <div className="mb-5 flex items-start gap-2 rounded-xl border-[3px] border-black bg-cream p-3">
              <Target size={20} strokeWidth={2.5} className="mt-0.5 shrink-0 text-coral" />
              <p><b className="font-jua">학습 목표</b> · {selected.goal}</p>
            </div>
            <ol className="relative space-y-4 border-l-[3px] border-dashed border-black pl-6">
              {STAGES.map((s, i) => (
                <motion.li
                  key={s.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.12 }}
                  className="relative"
                >
                  <span className={`absolute -left-[42px] top-0 grid h-8 w-8 place-items-center rounded-full border-[3px] border-black ${s.color} text-sm`}>
                    {s.emoji}
                  </span>
                  <div className="rounded-xl border-[3px] border-black bg-white p-4 shadow-retro-sm">
                    <h4 className="mb-2 text-lg">{s.label}</h4>
                    <ul className="space-y-1.5 text-sm">
                      {selected.flow[s.key].map((step) => (
                        <li key={step} className="flex gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 bg-black" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-jua text-sm">✔ 핵심 평가 요소 · 질문 포인트</span>
              {selected.badges.map((b) => (
                <span key={b} className="retro-chip bg-lavender/20">#{b}</span>
              ))}
            </div>
            <div className="mt-4 rotate-[-0.5deg] rounded-xl border-[3px] border-black bg-butter p-3 text-sm shadow-retro-sm">
              💡 <b>하연샘의 지도 팁</b> · {selected.tip}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
