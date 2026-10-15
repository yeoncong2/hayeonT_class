import { useCallback, useEffect, useRef, useState } from 'react';

// 외부 음원 없이 Web Audio로 만드는 작은 레트로 BGM 루프
const MELODY = [
  523, 659, 784, 659, 587, 698, 880, 698,
  523, 659, 784, 1047, 988, 784, 659, 0,
];
const BASS = [131, 131, 175, 175, 147, 147, 196, 196];
const STEP = 0.22;

export default function useChiptune() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
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
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
  };

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    ctxRef.current?.suspend();
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current) ctxRef.current = new AC();
    const ctx = ctxRef.current;
    await ctx.resume();
    nextTimeRef.current = ctx.currentTime + 0.05;
    timerRef.current = setInterval(() => {
      while (nextTimeRef.current < ctx.currentTime + 0.3) {
        const i = stepRef.current;
        note(ctx, MELODY[i % MELODY.length], nextTimeRef.current, 'square', 0.035, STEP * 0.9);
        if (i % 2 === 0) note(ctx, BASS[(i / 2) % BASS.length], nextTimeRef.current, 'triangle', 0.08, STEP * 1.8);
        nextTimeRef.current += STEP;
        stepRef.current = i + 1;
      }
    }, 80);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    ctxRef.current?.close();
  }, []);

  return { playing, toggle };
}
