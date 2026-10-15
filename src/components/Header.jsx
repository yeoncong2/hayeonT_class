import { motion } from 'framer-motion';
import { Music, VolumeX, Sparkles, Star, Heart, BookOpen, Search } from 'lucide-react';
import useChiptune from '../hooks/useChiptune';

const NAV = [
  { href: '#grades', label: '학년 고르기', short: '학년', color: 'bg-pink' },
  { href: '#units', label: '단원 탐험', short: '단원', color: 'bg-butter' },
  { href: '#assessment', label: '수행평가', short: '수행', color: 'bg-mint' },
];

function BgmToggle() {
  const { playing, toggle } = useChiptune();
  return (
    <button onClick={toggle} role="switch" aria-checked={playing} aria-label="레트로 BGM 켜기/끄기" className="btn bg-white px-2.5 py-1.5">
      {playing ? <Music size={16} strokeWidth={2.5} /> : <VolumeX size={16} strokeWidth={2.5} />}
      <span className={`relative h-5 w-9 rounded-full border-2 border-ink transition-colors ${playing ? 'bg-mint-deep' : 'bg-gray-200'}`}>
        <motion.span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-ink bg-butter"
          animate={{ left: playing ? 16 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}

const STICKERS = [
  { el: <Star size={26} fill="#FFF1A8" strokeWidth={2.2} />, pos: 'left-[6%] top-[16%]', bg: 'bg-pink', r: -12 },
  { el: <Heart size={24} fill="#FF8FAB" strokeWidth={2.2} />, pos: 'right-[7%] top-[12%]', bg: 'bg-butter', r: 14 },
  { el: <Sparkles size={24} fill="#E2D6FF" strokeWidth={2.2} />, pos: 'left-[11%] bottom-[16%]', bg: 'bg-mint', r: 8 },
  { el: <BookOpen size={26} fill="#CFE6FF" strokeWidth={2.2} />, pos: 'right-[12%] bottom-[20%]', bg: 'bg-lilac', r: -10 },
];

export default function Header({ title, subtitle, textbook, onStart }) {
  return (
    <header className="relative">
      <nav className="sticky top-0 z-40 border-b-2 border-ink bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
          <a href="#top" className="flex min-w-0 items-center gap-2 font-jua text-lg">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-butter shadow-pop-sm">🔎</span>
            <span className="hidden truncate md:inline">{title}</span>
          </a>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ul className="flex items-center gap-1.5 sm:gap-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className={`block rounded-full border-2 border-ink ${n.color} px-2.5 py-1 font-jua text-sm shadow-pop-sm transition-transform hover:-translate-y-0.5 sm:px-3 sm:text-base`}
                  >
                    <span className="sm:hidden">{n.short}</span>
                    <span className="hidden sm:inline">{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <BgmToggle />
          </div>
        </div>
      </nav>

      <section id="top" className="relative overflow-hidden px-4 pb-14 pt-12 sm:pb-20 sm:pt-20">
        {STICKERS.map((s, i) => (
          <motion.div
            key={i}
            aria-hidden
            className={`absolute hidden md:block ${s.pos}`}
            initial={{ rotate: s.r }}
            animate={{ y: [0, -10, 0], rotate: [s.r, s.r + 6, s.r] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={`grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink shadow-pop-sm ${s.bg}`}>{s.el}</div>
          </motion.div>
        ))}

        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            className="chip mb-5 rotate-[-3deg] bg-white px-4 py-1.5 text-sm shadow-pop-sm"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-deep" /> {textbook} 교과서로 함께 탐구해요
          </motion.span>

          <motion.h1
            className="text-[2.35rem] leading-[1.2] sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="relative inline-block">
              <span className="absolute inset-x-0 bottom-1 -z-10 h-4 -rotate-1 rounded-full bg-pink sm:h-6" />
              짱하연T
            </span>
            의
            <br />
            <span className="relative inline-block text-ink">
              국어 <span className="text-pink-deep [text-shadow:3px_3px_0_#3D3552]">탐구소</span>
            </span>{' '}
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, -14, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
            >
              🔎
            </motion.span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-xl font-jua text-xl text-ink/85 sm:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <button onClick={onStart} className="btn bg-pink-deep px-6 py-3 text-lg text-white [text-shadow:1px_1px_0_#3D3552]">
              <Search size={20} strokeWidth={2.5} /> 탐구 시작하기
            </button>
            <a href="#assessment" className="btn bg-white px-5 py-3 text-lg">
              🖼️ 수행평가 보러 가기
            </a>
          </motion.div>
        </div>
      </section>
    </header>
  );
}
