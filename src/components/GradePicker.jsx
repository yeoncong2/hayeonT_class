import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TONE } from '../lib/colors';
import SectionTitle from './SectionTitle';

function countLessons(g) {
  return Object.values(g.semesters).flat().reduce((n, u) => n + u.lessons.length, 0);
}

export default function GradePicker({ grades, current, onPick }) {
  return (
    <section id="grades" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          no={1}
          tag="학년 고르기"
          tone="bg-pink"
          title="몇 학년 탐구 대원인가요? 🎒"
          desc="내 학년 카드를 누르면 그 학년의 단원 탐험 섹션으로 바로 이동해요."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {grades.map((g, i) => {
            const t = TONE[g.color];
            const on = current === g.grade;
            return (
              <motion.button
                key={g.grade}
                onClick={() => onPick(g.grade)}
                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, rotate: i === 1 ? 1 : -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.08 }}
                aria-label={`${g.label} 단원 탐험으로 이동`}
                className={`group card relative overflow-hidden text-left ${on ? 'ring-4 ' + t.ring : ''}`}
              >
                {/* 카세트테이프 라벨 느낌의 윗부분 */}
                <div className={`dots relative flex h-40 items-center justify-center border-b-2 border-ink ${t.bg}`}>
                  <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-white px-2 font-jua text-xs">
                    GRADE {g.grade}
                  </span>
                  {!g.ready && (
                    <span className="absolute right-3 top-3 -rotate-6 rounded-full border-2 border-ink bg-butter px-2 font-jua text-xs">
                      교과서 준비 중
                    </span>
                  )}
                  <motion.span className="text-7xl drop-shadow-[3px_3px_0_#3D3552]" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4 + i * 0.3, repeat: Infinity }}>
                    {g.emoji}
                  </motion.span>
                  <div className="absolute bottom-3 flex gap-10" aria-hidden>
                    <span className="h-5 w-5 rounded-full border-2 border-ink bg-white transition-transform duration-700 group-hover:rotate-180" />
                    <span className="h-5 w-5 rounded-full border-2 border-ink bg-white transition-transform duration-700 group-hover:rotate-180" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl">{g.label}</h3>
                    <span className={`grid h-10 w-10 place-items-center rounded-full border-2 border-ink ${t.deep} text-white shadow-pop-sm transition-transform group-hover:translate-x-1`}>
                      <ArrowRight size={20} strokeWidth={3} />
                    </span>
                  </div>
                  <p className="mt-1 font-jua text-base text-ink/80">{g.tagline}</p>
                  <p className="mt-3 text-sm text-ink/80">
                    {g.ready ? `1·2학기 각 4단원 · 소단원 ${countLessons(g)}개` : '새 교과서가 나오면 채워질 예정이에요'}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
