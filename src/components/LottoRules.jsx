import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SectionTitle from './SectionTitle';

function Box({ tone, title, children, i = 0 }) {
  return (
    <motion.div
      className="card p-5 sm:p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: i * 0.05 }}
    >
      <h3 className={`mb-4 inline-block rounded-full border-2 border-ink ${tone} px-4 py-1 text-xl shadow-pop-sm`}>{title}</h3>
      {children}
    </motion.div>
  );
}

function Table({ caption, head, rows, tone }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border-2 border-ink text-center">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={tone}>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b-2 border-ink px-3 py-2 font-jua">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? 'bg-cream' : 'bg-white'}>
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 ${i < rows.length - 1 ? 'border-b border-ink/30' : ''} ${j === 0 ? 'font-jua' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 헤더의 [내 성적 맞춰봐] 칸으로 오는 섹션. 글은 모두 content.json 의 "lotto" 에서 바꿔요.
export default function LottoRules({ lotto }) {
  if (!lotto) return null;
  return (
    <section id="lotto" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle no={4} tag="내 성적 맞춰봐" tone="bg-lilac" title="🍀 내 성적 맞춰봐! 성적 예측 로또" desc={lotto.intro} />

        <div className="grid gap-6 md:grid-cols-2">
          <Box tone="bg-pink" title="① 참여 방법" i={0}>
            <ol className="space-y-2.5">
              {lotto.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-butter font-jua text-sm shadow-pop-sm">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl border-2 border-dashed border-ink/50 bg-white/70 px-3 py-2 text-sm text-ink/80">{lotto.deadline}</p>
          </Box>

          <Box tone="bg-butter" title="② 점수 계산" i={1}>
            <p className="mb-3 text-ink/85">{lotto.pointIntro}</p>
            <Table caption="오차 구간별 포인트" head={['오차 (예상과 실제의 차이)', '포인트']} rows={lotto.points.map((p) => [p.range, p.point])} tone="bg-butter" />
            <p className="mt-3 text-sm text-ink/85">{lotto.pointNote}</p>
          </Box>

          <Box tone="bg-mint" title="③ 당첨 방법" i={2}>
            <p className="mb-3 text-ink/85">{lotto.winningIntro}</p>
            <ul className="space-y-2">
              {lotto.winning.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-mint-deep" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Box>

          <Box tone="bg-sky" title="④ 계산 예시" i={3}>
            <p className="mb-3 text-ink/85">{lotto.exampleIntro}</p>
            <Table caption="계산 예시" head={['과목', '예상', '실제', '오차', '포인트']} rows={lotto.example} tone="bg-sky" />
            <p className="mt-3 text-sm text-ink/85">{lotto.exampleNote}</p>
          </Box>
        </div>

        <motion.div
          className="card mt-6 p-5 sm:p-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
        >
          <h3 className="mb-4 inline-block rounded-full border-2 border-ink bg-lilac px-4 py-1 text-xl shadow-pop-sm">자주 묻는 질문</h3>
          <div className="space-y-2.5">
            {lotto.faq.map((f, i) => (
              <details key={i} className="group rounded-xl border-2 border-ink bg-white open:bg-cream">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-jua text-lg [&::-webkit-details-marker]:hidden">
                  <span>Q. {f.q}</span>
                  <ChevronDown size={20} strokeWidth={3} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="px-4 pb-3 text-ink/85">{f.a}</p>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
