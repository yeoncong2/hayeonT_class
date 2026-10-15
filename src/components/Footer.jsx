import { ArrowUp, Server } from 'lucide-react';
import TermCards from '../vue/TermCards.vue';
import VueIsland from './VueIsland';

export default function Footer({ title, terms, live }) {
  return (
    <footer className="border-t-2 border-ink bg-lilac/50 px-4 pb-10 pt-14">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl">{title} 🔎</h2>
          <p className="max-w-md text-ink/75">
            미래엔(신유식) 국어 교과서로 1~3학년이 함께 읽고, 묻고, 쓰는 공간이에요. 궁금한 개념은 옆의 카드로 가볍게 복습해 보세요.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="#grades" className="btn bg-pink px-3 py-1.5 text-sm">학년 고르기</a>
            <a href="#units" className="btn bg-butter px-3 py-1.5 text-sm">단원 탐험</a>
            <a href="#assessment" className="btn bg-mint px-3 py-1.5 text-sm">수행평가</a>
            <a href="#top" className="btn bg-white px-3 py-1.5 text-sm" aria-label="맨 위로">
              <ArrowUp size={16} strokeWidth={3} />
            </a>
          </div>
          <p className="mt-auto inline-flex items-center gap-1.5 text-xs text-ink/50">
            <Server size={12} /> {live ? '콘텐츠 서버에 연결됨' : '내장 콘텐츠로 보는 중'} · React + Vue + Tailwind
          </p>
        </div>
        <div className="card bg-white p-5">
          <VueIsland component={TermCards} props={{ terms }} />
        </div>
      </div>
      <p className="mt-10 text-center font-hand text-lg text-ink/60">© 짱하연T의 국어 탐구소 · 오늘도 질문 하나 품고 가기 ✨</p>
    </footer>
  );
}
