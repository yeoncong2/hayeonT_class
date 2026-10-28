import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, FileText, ChevronRight, PackageOpen } from 'lucide-react';
import { TONE, UNIT_TONES, AREA_TONE } from '../lib/colors';
import SectionTitle from './SectionTitle';
import Modal from './Modal';

function LinkButton({ href, icon: Icon, label, className, onMissing }) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`btn px-3 py-1.5 text-sm ${className}`}>
        <Icon size={16} strokeWidth={2.5} /> {label}
      </a>
    );
  }
  return (
    <button onClick={onMissing} className={`btn px-3 py-1.5 text-sm opacity-80 ${className}`}>
      <Icon size={16} strokeWidth={2.5} /> {label}
    </button>
  );
}

function UnitModal({ unit, tone, grade, semester, onClose, notify }) {
  return (
    <Modal
      open={!!unit}
      onClose={onClose}
      title={unit ? `${unit.no}. ${unit.title}` : ''}
      icon={unit?.emoji}
      headerColor={TONE[tone].bg}
      maxWidth="max-w-xl"
    >
      {unit && (
        <>
          <p className="mb-4 text-sm text-ink/80">
            {grade}학년 {semester}학기 · 소단원을 골라 교과서 자료나 활동지를 열어 보세요.
          </p>
          <ol className="space-y-3">
            {unit.lessons.map((l, i) => {
              const at = TONE[AREA_TONE[l.area] || 'sky'];
              return (
                <motion.li
                  key={l.title}
                  className="card p-4 shadow-pop-sm"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.07 }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-white font-jua text-sm">({i + 1})</span>
                    <h4 className="text-lg">{l.title}</h4>
                    <span className={`chip ${at.bg}`}>{l.area}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <LinkButton href={l.textbook} icon={BookOpen} label="교과서 자료" className="bg-sky" onMissing={() => notify('📘 교과서 자료를 준비하고 있어요!')} />
                    <LinkButton href={l.worksheet} icon={FileText} label="활동지" className="bg-butter" onMissing={() => notify('📝 활동지를 준비하고 있어요!')} />
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </>
      )}
    </Modal>
  );
}

export default function UnitExplorer({ grades, grade, semester, onGrade, onSemester, openNo, onOpen, notify }) {
  const g = grades.find((x) => x.grade === grade) || grades[0];
  const units = g.semesters[semester] || [];
  const openIdx = units.findIndex((u) => u.no === openNo && u.lessons.length > 0);
  const t = TONE[g.color];

  return (
    <section id="units" className={`scroll-mt-16 border-y-2 border-ink px-4 py-14 sm:py-20 ${t.soft}`}>
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          no={2}
          tag="단원 탐험"
          tone="bg-butter"
          title={`${g.emoji} ${g.label} 국어 · 1~4단원`}
          desc="단원을 누르면 소단원별 교과서 자료와 활동지로 이동할 수 있어요."
        >
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex rounded-full border-2 border-ink bg-white p-1 shadow-pop-sm" role="tablist" aria-label="학년">
              {grades.map((x) => (
                <button
                  key={x.grade}
                  role="tab"
                  aria-selected={x.grade === grade}
                  onClick={() => onGrade(x.grade)}
                  className={`relative rounded-full px-3 py-1 font-jua text-sm sm:px-4 sm:text-base`}
                >
                  {x.grade === grade && (
                    <motion.span layoutId="gradePill" className={`absolute inset-0 rounded-full border-2 border-ink ${TONE[x.color].bg}`} />
                  )}
                  <span className="relative">{x.label}</span>
                </button>
              ))}
            </div>
            <div className="flex rounded-full border-2 border-ink bg-white p-1 shadow-pop-sm" role="tablist" aria-label="학기">
              {['1', '2'].map((s) => (
                <button key={s} role="tab" aria-selected={s === semester} onClick={() => onSemester(s)} className="relative rounded-full px-3 py-1 font-jua text-sm sm:px-4 sm:text-base">
                  {s === semester && <motion.span layoutId="semPill" className="absolute inset-0 rounded-full border-2 border-ink bg-butter" />}
                  <span className="relative">{s}학기</span>
                </button>
              ))}
            </div>
            <span className="font-jua text-base text-ink/80">국어 {g.grade}-{semester} · 미래엔(신유식)</span>
          </div>
        </SectionTitle>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${grade}-${semester}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {units.map((u, i) => {
              const ut = TONE[UNIT_TONES[i % 4]];
              const empty = !g.ready || u.lessons.length === 0;
              return (
                <motion.button
                  key={u.no}
                  onClick={() => (empty ? notify('📦 3학년 교과서가 나오면 채워질 거예요!') : onOpen(u.no))}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group card flex flex-col overflow-hidden text-left ${empty ? 'border-dashed' : ''}`}
                >
                  <div className={`stripes flex items-center justify-between border-b-2 border-ink px-4 py-3 ${ut.bg} ${empty ? 'border-dashed' : ''}`}>
                    <span className="font-jua text-4xl leading-none">{String(u.no).padStart(2, '0')}</span>
                    <span className="text-4xl">{u.emoji}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start gap-2">
                      <h3 className="text-xl leading-snug">{empty ? `${u.no}단원` : u.title}</h3>
                      {u.badge && <span className="chip mt-1 shrink-0 bg-lilac">{u.badge}</span>}
                    </div>
                    {empty ? (
                      <div className="mt-3 flex flex-1 flex-col items-start gap-2 text-sm text-ink/80">
                        <span className="chip bg-butter">
                          <PackageOpen size={12} /> 교과서 준비 중
                        </span>
                        <span>새 교과서가 나오면 단원과 자료가 여기에 채워져요.</span>
                      </div>
                    ) : (
                      <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                        {u.lessons.map((l, j) => (
                          <li key={l.title} className="flex items-center gap-1.5">
                            <span className="font-jua text-ink/70">({j + 1})</span> {l.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!empty && (
                      <span className="mt-4 inline-flex items-center gap-1 self-end font-jua text-sm text-ink/80 transition-transform group-hover:translate-x-1">
                        자료 · 활동지 열기 <ChevronRight size={16} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <UnitModal
        unit={g.ready && openIdx >= 0 ? units[openIdx] : null}
        tone={UNIT_TONES[Math.max(openIdx, 0) % 4]}
        grade={g.grade}
        semester={semester}
        onClose={() => onOpen(null)}
        notify={notify}
      />
    </section>
  );
}
