<script setup>
// Vue 3 위젯: 단원 핵심 용어 뒤집기 카드 (React 화면 안에 섬처럼 붙어 있어요)
import { computed, ref } from 'vue';

const props = defineProps({ terms: { type: Array, default: () => [] } });
const index = ref(0);
const flipped = ref(false);
const seen = ref(new Set([0]));

const term = computed(() => props.terms[index.value] || { word: '', meaning: '', unit: '' });
const progress = computed(() => Math.round((seen.value.size / Math.max(props.terms.length, 1)) * 100));

function go(step) {
  flipped.value = false;
  index.value = (index.value + step + props.terms.length) % props.terms.length;
  seen.value = new Set([...seen.value, index.value]);
}
</script>

<template>
  <div class="term-widget">
    <div class="mb-3 flex items-center justify-between gap-2">
      <span class="chip bg-lilac">🧠 개념 카드</span>
      <span class="font-hand text-lg text-ink/70">{{ index + 1 }} / {{ terms.length }}</span>
    </div>

    <button
      class="flip-wrap block w-full text-left"
      :aria-label="flipped ? `${term.word} 뜻: ${term.meaning}` : `${term.word} 카드 뒤집기`"
      @click="flipped = !flipped"
    >
      <div class="flip" :class="{ on: flipped }">
        <div class="face card grid place-items-center bg-butter p-5 text-center">
          <div>
            <p class="text-xs font-bold text-ink/60">{{ term.unit }}</p>
            <p class="mt-1 font-jua text-4xl">{{ term.word }}</p>
            <p class="mt-2 font-hand text-lg text-ink/60">눌러서 뜻 확인 👆</p>
          </div>
        </div>
        <div class="face back card grid place-items-center bg-mint p-5 text-center">
          <p class="text-lg leading-relaxed">{{ term.meaning }}</p>
        </div>
      </div>
    </button>

    <div class="mt-4 flex items-center gap-2">
      <button class="btn bg-white px-3 py-1 text-sm" @click="go(-1)">◀ 이전</button>
      <div class="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-white">
        <div class="h-full bg-pink-deep transition-all duration-500" :style="{ width: progress + '%' }" />
      </div>
      <button class="btn bg-white px-3 py-1 text-sm" @click="go(1)">다음 ▶</button>
    </div>
  </div>
</template>

<style scoped>
.flip-wrap { perspective: 900px; }
.flip {
  position: relative;
  height: 9.5rem;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.flip.on { transform: rotateY(180deg); }
.face { position: absolute; inset: 0; backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) { .flip { transition: none; } }
</style>
