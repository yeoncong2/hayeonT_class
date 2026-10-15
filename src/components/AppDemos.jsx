import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { poetChat, quizQuestions, debateTopics, detectiveCase } from '../data/mockData';

function ChatDemo() {
  const [log, setLog] = useState([{ from: 'bot', text: '안녕하세요, 저는 AI 시인이에요. 시에 대해 무엇이든 물어봐 주세요! 🖋️' }]);
  const [typing, setTyping] = useState(false);
  const asked = log.filter((m) => m.from === 'me').map((m) => m.text);

  const ask = (item) => {
    if (typing) return;
    setLog((l) => [...l, { from: 'me', text: item.q }]);
    setTyping(true);
    setTimeout(() => {
      setLog((l) => [...l, { from: 'bot', text: item.a }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div>
      <div className="pixel-patch mb-4 h-64 space-y-3 overflow-y-auto rounded-xl border-[3px] border-black bg-[#FFE0E0] p-3">
        {log.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl border-2 border-black px-3 py-2 text-sm shadow-retro-sm ${
                m.from === 'me' ? 'bg-butter' : 'bg-white'
              }`}
            >
              {m.from === 'bot' && <span className="mr-1">🤖</span>}
              {m.text}
            </div>
          </motion.div>
        ))}
        {typing && <div className="w-16 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm">···</div>}
      </div>
      <p className="mb-2 font-jua text-sm">질문을 골라 보세요 👇</p>
      <div className="flex flex-col gap-2">
        {poetChat.map((item) => (
          <button
            key={item.q}
            disabled={asked.includes(item.q) || typing}
            onClick={() => ask(item)}
            className="rounded-lg border-2 border-black bg-white px-3 py-2 text-left text-sm transition-all hover:bg-butter disabled:opacity-40"
          >
            ❓ {item.q}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuizDemo() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const done = idx >= quizQuestions.length;
  const level = 1 + Math.floor(score / 20);
  const q = quizQuestions[idx];

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 10);
  };
  const next = () => {
    setPicked(null);
    setIdx((n) => n + 1);
  };
  const reset = () => {
    setIdx(0);
    setScore(0);
    setPicked(null);
  };

  return (
    <div className="rounded-xl border-[3px] border-black bg-[#2B2B3A] p-4 text-white">
      <div className="mb-4 flex items-center justify-between font-jua">
        <span className="rounded-md border-2 border-white bg-coral px-2">LV.{level}</span>
        <span>SCORE {String(score).padStart(3, '0')}</span>
        <span className="text-butter">{'♥'.repeat(3)}</span>
      </div>
      <div className="mb-3 h-3 overflow-hidden rounded-full border-2 border-white">
        <motion.div className="h-full bg-butter" animate={{ width: `${(Math.min(idx, quizQuestions.length) / quizQuestions.length) * 100}%` }} />
      </div>
      {done ? (
        <div className="py-6 text-center">
          <Trophy className="mx-auto mb-2 text-butter" size={44} />
          <p className="font-jua text-2xl">STAGE CLEAR!</p>
          <p className="mt-1 text-white/80">최종 점수 {score}점 · 레벨 {level} 달성 🎉</p>
          <button onClick={reset} className="retro-btn mt-4 bg-butter text-black">
            <RotateCcw size={16} /> 다시 하기
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 font-jua text-lg">Q{idx + 1}. {q.q}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const state = picked === null ? '' : i === q.answer ? 'bg-mint text-black' : picked === i ? 'bg-coral' : 'opacity-50';
              return (
                <button
                  key={o}
                  onClick={() => choose(i)}
                  className={`rounded-lg border-[3px] border-white px-3 py-2 font-jua transition-all hover:bg-white/10 ${state}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white/85">
                  {picked === q.answer ? '⭕ 정답! +10점' : '❌ 아쉬워요!'} {q.tip}
                </p>
                <button onClick={next} className="rounded-lg border-2 border-white bg-butter px-3 py-1 font-jua text-black">
                  다음 ▶
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function DebateDemo() {
  const [t, setT] = useState(0);
  const [cards, setCards] = useState([]);
  const topic = debateTopics[t];

  const draw = () => {
    const remaining = topic.rebuttals.filter((r) => !cards.includes(r));
    if (!remaining.length) return;
    setCards((c) => [...c, remaining[Math.floor(Math.random() * remaining.length)]]);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {debateTopics.map((d, i) => (
          <button
            key={d.topic}
            onClick={() => {
              setT(i);
              setCards([]);
            }}
            className={`rounded-full border-2 border-black px-3 py-1 text-xs font-bold ${t === i ? 'bg-candy' : 'bg-white'}`}
          >
            논제 {i + 1}
          </button>
        ))}
      </div>
      <div className="rounded-xl border-[3px] border-black bg-[#D5F5F2] p-4 text-sm">
        <p className="font-jua text-base">📋 입론서: {topic.topic}</p>
        <dl className="mt-2 space-y-1">
          <div><dt className="inline font-bold">주장 · </dt><dd className="inline">{topic.claim}</dd></div>
          {topic.reasons.map((r, i) => (
            <div key={r}><dt className="inline font-bold">근거 {i + 1} · </dt><dd className="inline">{r}</dd></div>
          ))}
        </dl>
      </div>
      <button onClick={draw} disabled={cards.length >= topic.rebuttals.length} className="retro-btn mt-4 w-full bg-butter disabled:opacity-50">
        <Shuffle size={16} /> 반박 질문 카드 뽑기 ({cards.length}/{topic.rebuttals.length})
      </button>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {cards.map((c, i) => (
            <motion.div
              key={c}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1, rotate: i % 2 ? 1.5 : -1.5 }}
              className="rounded-xl border-[3px] border-black bg-white p-3 text-sm shadow-retro-sm"
            >
              <span className="mb-1 block font-jua text-coral">반박 Q{i + 1}</span>
              {c}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetectiveDemo() {
  const { characters, links, questions, book } = detectiveCase;
  const [active, setActive] = useState(null);
  const pos = Object.fromEntries(characters.map((c) => [c.id, c]));

  return (
    <div>
      <p className="mb-2 font-jua">🕵️ 수사 파일: {book}</p>
      <div className="relative aspect-[4/3] w-full rounded-xl border-[3px] border-black bg-[#EEDCFD]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {links.map((l) => {
            const on = !active || active === l.from || active === l.to;
            return (
              <line
                key={l.from + l.to}
                x1={pos[l.from].x} y1={pos[l.from].y} x2={pos[l.to].x} y2={pos[l.to].y}
                stroke="#000" strokeWidth={on ? 0.8 : 0.3} strokeDasharray="2 1.5"
                vectorEffect="non-scaling-stroke" style={{ strokeWidth: on ? 3 : 1, opacity: on ? 1 : 0.3 }}
              />
            );
          })}
        </svg>
        {links.map((l) => {
          const on = !active || active === l.from || active === l.to;
          return (
            <span
              key={'lb' + l.from + l.to}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-black bg-white px-1.5 text-[11px] font-bold transition-opacity sm:text-xs ${on ? '' : 'opacity-20'}`}
              style={{ left: `${(pos[l.from].x + pos[l.to].x) / 2}%`, top: `${(pos[l.from].y + pos[l.to].y) / 2}%` }}
            >
              {l.label}
            </span>
          );
        })}
        {characters.map((c) => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.1 }}
            onClick={() => setActive(active === c.id ? null : c.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border-[3px] border-black px-2 py-1 font-jua text-sm shadow-retro-sm sm:text-base"
            style={{ left: `${c.x}%`, top: `${c.y}%`, background: c.color }}
          >
            {c.name}
          </motion.button>
        ))}
      </div>
      <p className="mt-1 text-xs text-black/60">인물을 누르면 관계선이 강조돼요.</p>
      <p className="mb-2 mt-4 font-jua">🔑 핵심 질문 작성 예시</p>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={q} className="rounded-lg border-2 border-black bg-white px-3 py-2 text-sm">
            <b className="mr-1 text-lavender">Q{i + 1}.</b>{q}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const DEMOS = { chat: ChatDemo, quiz: QuizDemo, debate: DebateDemo, detective: DetectiveDemo };
