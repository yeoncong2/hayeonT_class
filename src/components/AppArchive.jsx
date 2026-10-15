import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Eye, Check } from 'lucide-react';
import { webApps, UNIT_COLORS } from '../data/mockData';
import SectionTitle from './SectionTitle';
import Modal from './Modal';
import { DEMOS } from './AppDemos';

function AppCard({ app, index, onDemo, onLaunch }) {
  const color = UNIT_COLORS[app.unit];
  return (
    <motion.article
      className="group flex flex-col rounded-[22px] border-[3px] border-black bg-white shadow-retro transition-all duration-150 hover:translate-y-1 hover:shadow-retro-sm"
      initial={{ opacity: 0, y: 40, rotate: index % 2 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* 오락기 스크린 */}
      <div className={`relative m-3 overflow-hidden rounded-2xl border-[3px] border-black ${color.bg} pixel-patch`}>
        <div className="flex items-center justify-between border-b-[3px] border-black bg-black/85 px-3 py-1.5 font-jua text-xs text-white">
          <span>UNIT 0{app.unit}</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> {app.level}
          </span>
        </div>
        <div className="grid h-32 place-items-center">
          <motion.span
            className="text-6xl drop-shadow-[3px_3px_0_#000]"
            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          >
            {app.emoji}
          </motion.span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <span className={`retro-chip mb-2 w-fit ${color.soft}`}>{app.unit}단원 · {app.unitTitle}</span>
        <h3 className="text-xl leading-snug">{app.name}</h3>
        <p className="mt-2 text-sm text-black/70">{app.summary}</p>
        <ul className="mb-5 mt-3 space-y-1 text-sm">
          {app.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <Check size={14} strokeWidth={3} className="text-candy" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-auto grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button onClick={() => onLaunch(app)} className="retro-btn bg-butter px-2 text-sm">
            <Play size={15} strokeWidth={3} /> 웹앱 실행하기
          </button>
          <button onClick={() => onDemo(app)} className="retro-btn bg-white px-2 text-sm">
            <Eye size={15} strokeWidth={3} /> 체험 모달 보기
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function AppArchive({ notify }) {
  const [demoApp, setDemoApp] = useState(null);
  const Demo = demoApp ? DEMOS[demoApp.demo] : null;

  const launch = (app) => {
    if (app.url) window.open(app.url, '_blank', 'noopener,noreferrer');
    else notify(`🚧 「${app.name}」 링크는 곧 공개돼요! 먼저 체험 모달로 만나 보세요.`);
  };

  return (
    <section id="baeum" className="scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          tag="SECTION 1 · 배움터"
          tagColor="bg-coral"
          icon={Gamepad2}
          title="1~4단원 학습 웹앱 아카이브 🕹️"
          desc="하연샘이 바이브코딩으로 직접 만든 수업용 웹앱이에요. 동전 대신 질문 하나를 넣고 플레이해 보세요!"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {webApps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} onDemo={setDemoApp} onLaunch={launch} />
          ))}
        </div>
      </div>

      <Modal
        open={!!demoApp}
        onClose={() => setDemoApp(null)}
        title={demoApp ? `${demoApp.name} 체험` : ''}
        icon={demoApp?.emoji}
        headerColor={demoApp ? UNIT_COLORS[demoApp.unit].bg : 'bg-butter'}
        maxWidth="max-w-xl"
      >
        {demoApp && (
          <>
            <p className="mb-4 text-sm text-black/70">
              <b>{demoApp.unit}단원 「{demoApp.unitTitle}」</b> · {demoApp.summary}
            </p>
            <Demo />
          </>
        )}
      </Modal>
    </section>
  );
}
