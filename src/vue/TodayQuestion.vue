<script setup>
// Vue 3 위젯: 날짜마다 바뀌는 "오늘의 질문" 한 가지 (React 화면 안에 섬처럼 붙어 있어요)
import { computed, ref, watch } from 'vue';

const props = defineProps({ questions: { type: Array, default: () => [] } });

const now = new Date();
const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
const dayNumber = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
const dateLabel = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

const question = computed(() => (props.questions.length ? props.questions[dayNumber % props.questions.length] : ''));

// 내 생각 메모는 이 기기에만 저장돼요.
const storeKey = `today-question-${dayKey}`;
const readMemo = () => {
  try {
    return localStorage.getItem(storeKey) || '';
  } catch {
    return '';
  }
};
const memo = ref(readMemo());
const saved = ref(false);
watch(memo, (v) => {
  saved.value = false;
  try {
    localStorage.setItem(storeKey, v);
    saved.value = true;
  } catch {}
});
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span class="chip bg-pink">💬 오늘의 질문</span>
      <span class="font-jua text-base text-ink/80">{{ dateLabel }}</span>
    </div>

    <div class="card relative bg-butter px-5 py-6 shadow-pop-sm">
      <p class="font-jua text-xl leading-relaxed sm:text-2xl">{{ question }}</p>
    </div>

    <label class="mt-4 block">
      <span class="mb-1.5 block text-sm font-medium text-ink/80">내 생각 적어 보기</span>
      <textarea
        v-model="memo"
        rows="3"
        placeholder="떠오르는 생각을 자유롭게 적어 보세요."
        class="w-full resize-none rounded-2xl border-2 border-ink bg-white px-4 py-3 text-base leading-relaxed outline-none focus:ring-4 focus:ring-pink-deep/30"
      />
    </label>
    <p class="mt-1 text-xs text-ink/75">{{ saved && memo ? '이 기기에 저장했어요. 질문은 내일 새로 바뀌어요.' : '질문은 날마다 하나씩 새로 바뀌어요.' }}</p>
  </div>
</template>
