import { useCallback, useEffect, useRef, useState } from 'react';

// 외부 음원 없이 Web Audio로 만드는 작은 레트로 BGM 루프
const MELODY = [
  523, 659, 784, 659, 587, 698, 880, 698,
  523, 659, 784, 1047, 988, 784, 659, 0,
];
const BASS = [131, 131, 175, 175, 147, 147, 196, 196];
const STEP = 0.22;
const OFF_KEY = 'bgm-off';

const readOff = () => {
  try { return localStorage.getItem(OFF_KEY) === '1'; } catch { return false; }
};
const writeOff = (off) => {
  try { off ? localStorage.setItem(OFF_KEY, '1') : localStorage.removeItem(OFF_KEY); } catch { /* 무시 */ }
};

export default function useChiptune() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const nextTimeRef = useRef(0);

  const note = (ctx, freq, time, type, vol, dur) => {
    if (!freq) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(masterRef.current);
    osc.start(time);
    osc.stop(time + dur);
  };

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    ctxRef.current?.suspend();
    setPlaying(false);
  }, []);

  // 반드시 클릭·터치 같은 사용자 동작 안에서 불러야 브라우저가 소리를 허락해요
  const start = useCallback(() => {
    if (timerRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // 아이폰 무음 모드에서도 들리도록 (Safari 16.4+)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* 무시 */ }
    if (!ctxRef.current) {
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    ctx.resume();
    // 사용자 동작 안에서 바로 소리 하나를 예약해 iOS 오디오 잠금을 풀어요
    const unlock = ctx.createBufferSource();
    unlock.buffer = ctx.createBuffer(1, 1, 22050);
    unlock.connect(ctx.destination);
    unlock.start(0);

    nextTimeRef.current = ctx.currentTime + 0.05;
    timerRef.current = setInterval(() => {
      if (ctx.state !== 'running') return;
      if (nextTimeRef.current < ctx.currentTime) nextTimeRef.current = ctx.currentTime + 0.05;
      while (nextTimeRef.current < ctx.currentTime + 0.3) {
        const i = stepRef.current;
        note(ctx, MELODY[i % MELODY.length], nextTimeRef.current, 'square', 0.07, STEP * 0.9);
        if (i % 2 === 0) note(ctx, BASS[(i / 2) % BASS.length], nextTimeRef.current, 'triangle', 0.16, STEP * 1.8);
        nextTimeRef.current += STEP;
        stepRef.current = i + 1;
      }
    }, 80);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (timerRef.current) {
      writeOff(true);
      stop();
    } else {
      writeOff(false);
      start();
    }
  }, [start, stop]);

  // 브라우저는 자동 재생을 막기 때문에, 화면을 처음 누르는 순간 BGM을 켜요.
  // (예전에 직접 끈 적이 있으면 켜지 않아요)
  useEffect(() => {
    if (readOff()) return undefined;
    const events = ['pointerdown', 'keydown', 'touchend'];
    const onFirst = (e) => {
      if (e.target?.closest?.('[data-bgm-toggle]')) return; // 토글 버튼은 자기 클릭으로 처리
      remove();
      if (!readOff()) start();
    };
    const remove = () => events.forEach((t) => window.removeEventListener(t, onFirst, true));
    events.forEach((t) => window.addEventListener(t, onFirst, true));
    return remove;
  }, [start]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    ctxRef.current?.close();
  }, []);

  return { playing, toggle };
}
