import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Modal from './Modal';

const CATEGORIES = ['📚 수업 내용', '✍️ 과제·활동', '📖 책 추천', '💭 고민 상담', '🎈 그냥 궁금해요'];

export default function QuestionModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const close = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setText('');
      setName('');
      setCategory(CATEGORIES[0]);
    }, 300);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSent(true);
  };

  return (
    <Modal open={open} onClose={close} title="하연샘에게 질문하기" icon="📮" headerColor="bg-coral">
      {sent ? (
        <div className="py-6 text-center">
          <motion.div
            className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full border-[3px] border-black bg-butter text-5xl shadow-retro"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            💌
          </motion.div>
          <h4 className="text-2xl">질문이 도착했어요!</h4>
          <p className="mt-2 text-black/70">
            {name ? `${name} 학생, ` : ''}좋은 질문 고마워요. 하연샘이 꼭 읽고 답할게요 🌟
          </p>
          <div className="retro-box mx-auto mt-5 max-w-sm rotate-1 bg-cream p-4 text-left text-sm">
            <span className="retro-chip mb-2 bg-white">{category}</span>
            <p className="whitespace-pre-wrap">{text}</p>
          </div>
          <button onClick={close} className="retro-btn mt-6 bg-mint">
            확인
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-black/70">궁금한 건 무엇이든 좋아요. 질문하는 순간 생각이 자라기 시작해요! 🌱</p>
          <label className="block">
            <span className="mb-1 block font-jua">이름 (선택)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2학년 3반 김국어"
              className="w-full rounded-xl border-[3px] border-black bg-cream px-3 py-2 outline-none focus:bg-white focus:shadow-retro-sm"
            />
          </label>
          <fieldset>
            <legend className="mb-2 font-jua">질문 종류</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border-2 border-black px-3 py-1 text-sm font-bold transition-all ${
                    category === c ? 'bg-butter shadow-retro-sm -translate-y-0.5' : 'bg-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1 block font-jua">나의 질문 ✏️</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 300))}
              rows={4}
              required
              placeholder="예: 시인은 왜 하필 ‘호수’에 마음을 빗댔을까요?"
              className="w-full resize-none rounded-xl border-[3px] border-black bg-cream px-3 py-2 outline-none focus:bg-white focus:shadow-retro-sm"
            />
            <span className="block text-right text-xs text-black/50">{text.length}/300</span>
          </label>
          <button type="submit" disabled={!text.trim()} className="retro-btn w-full bg-coral py-3 text-lg text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Send size={18} strokeWidth={2.5} /> 질문 우체통에 넣기
          </button>
        </form>
      )}
    </Modal>
  );
}
