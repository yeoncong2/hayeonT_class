<script setup>
// Vue 3 위젯: 날짜마다 바뀌는 "오늘의 질문" + 모두의 답이 열매로 열리는 "생각 나무"
// 답은 Supabase(question_answers 표)에 저장돼서 친구들과 함께 볼 수 있어요.
// 표가 아직 없거나 연결이 안 되면 이 기기에만 저장하는 연습 모드로 조용히 바뀌어요.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  BODY_MAX, DEMO, NICK_MAX, checkAnswer, clean, dayKeyOf, fetchAnswers, postAnswer, readLocal, saveLocal,
} from '../lib/answers';

const props = defineProps({ questions: { type: Array, default: () => [] } });

const now = new Date();
const dayKey = dayKeyOf(now);
const dayNumber = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
const dateLabel = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
const question = computed(() => (props.questions.length ? props.questions[dayNumber % props.questions.length] : ''));

// ---- 나무에 열매 자리 정하기 ---------------------------------------------------
// 해바라기 씨앗 배치(황금각)로 수관 안에 고르게 자리를 만들고, 7칸씩 건너뛰며 채워서
// 열매가 한쪽에 몰리지 않게 해요. 자리는 항상 같아서 새로고침해도 열매가 그대로예요.
const SLOTS = 28;
const VB_W = 320;
const VB_H = 280;
const slots = (() => {
  const pts = [];
  for (let i = 0; i < SLOTS; i++) {
    const r = Math.sqrt((i + 0.6) / SLOTS);
    const t = i * 2.399963;
    pts.push({ x: 160 + 98 * r * Math.cos(t), y: 108 + 66 * r * Math.sin(t) });
  }
  return Array.from({ length: SLOTS }, (_, i) => pts[(i * 11) % SLOTS]);
})();
const FRUIT_COLORS = ['#FF8FAB', '#FFAD6B', '#F5C93B', '#A68BF0', '#6AA9EE', '#FF7A7A'];
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// ---- 상태 ---------------------------------------------------------------------
const mode = ref('loading'); // loading | live | local
const answers = ref([]); // 오래된 순
const mineKey = `answer-tree-mine-${dayKey}`;
const readJSON = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null') ?? d;
  } catch {
    return d;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const mine = ref(new Set(readJSON(mineKey, [])));
const fresh = ref(new Set()); // 방금 열린 열매(톡 튀어나오는 효과)

const shown = computed(() => (answers.value.length ? answers.value : DEMO));
// 나무에는 최근 SLOTS 개만 달려요. n번째 답은 늘 (n % SLOTS) 자리에 열려서, 새 열매가 가장 오래된 열매 자리를 이어받아요.
const fruits = computed(() => {
  const list = shown.value;
  const start = Math.max(0, list.length - SLOTS);
  return list.slice(start).map((a, k) => {
    const n = start + k;
    const s = slots[n % SLOTS];
    return {
      ...a,
      left: (s.x / VB_W) * 100,
      top: (s.y / VB_H) * 100,
      color: FRUIT_COLORS[hash(a.id) % FRUIT_COLORS.length],
      tilt: (hash(a.id) % 30) - 15,
    };
  });
});
const extra = computed(() => Math.max(0, answers.value.length - SLOTS));

const selected = ref(null);
const showAll = ref(false);
const timeLabel = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }) : '';

// ---- 불러오기 -------------------------------------------------------------------
const load = async () => {
  try {
    const rows = await fetchAnswers(dayKey);
    const before = new Set(answers.value.map((a) => a.id));
    if (mode.value === 'live') rows.forEach((r) => !before.has(r.id) && fresh.value.add(r.id));
    answers.value = rows;
    mode.value = 'live';
  } catch {
    if (mode.value !== 'live') {
      answers.value = readLocal(dayKey);
      mode.value = 'local';
    }
  }
};

let timer;
const tick = () => document.visibilityState === 'visible' && mode.value === 'live' && load();
const onKey = (e) => e.key === 'Escape' && (selected.value = null);
onMounted(() => {
  load();
  timer = setInterval(tick, 30000);
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener('keydown', onKey);
});

// ---- 열매 달기 ------------------------------------------------------------------
const nickname = ref(readJSON('answer-tree-nick', ''));
const body = ref('');
const notice = ref('');
const busy = ref(false);
const cooldown = ref(false);

const submit = async () => {
  if (busy.value || cooldown.value) return;
  const nick = clean(nickname.value, NICK_MAX).replace(/\n/g, ' ');
  const text = clean(body.value, BODY_MAX);
  const problem = checkAnswer(nick, text);
  if (problem) {
    notice.value = problem;
    return;
  }
  busy.value = true;
  notice.value = '';
  let row;
  if (mode.value === 'live') {
    try {
      row = await postAnswer({ questionKey: dayKey, question: question.value, nickname: nick, body: text });
    } catch {
      notice.value = '앗, 지금은 열매를 달 수 없어요. 잠시 뒤에 다시 해 볼까요?';
      busy.value = false;
      return;
    }
  } else {
    row = { id: `local-${Date.now()}`, nickname: nick, body: text, created_at: new Date().toISOString() };
  }
  if (!answers.value.some((a) => a.id === row.id)) answers.value = [...answers.value, row];
  if (mode.value === 'local') saveLocal(dayKey, answers.value);
  mine.value = new Set([...mine.value, row.id]);
  writeJSON(mineKey, [...mine.value]);
  writeJSON('answer-tree-nick', nick);
  fresh.value.add(row.id);
  body.value = '';
  notice.value = mode.value === 'live' ? '내 생각이 열매로 열렸어요! 🍎' : '이 기기의 나무에 열매가 열렸어요! 🍎';
  busy.value = false;
  cooldown.value = true;
  setTimeout(() => (cooldown.value = false), 20000);
};
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span class="chip bg-pink">💬 오늘의 질문</span>
      <span class="font-jua text-base text-ink/80">{{ dateLabel }}</span>
    </div>

    <div class="card relative bg-butter px-5 py-5 shadow-pop-sm">
      <p class="font-jua text-xl leading-relaxed sm:text-2xl">{{ question }}</p>
    </div>

    <!-- 생각 나무 -->
    <div class="relative mt-4 overflow-hidden rounded-3xl border-2 border-ink bg-sky/50">
      <div class="flex items-center justify-between px-4 pt-3">
        <span class="font-jua text-base">🌳 우리 반 생각 나무</span>
        <span class="chip bg-white">열매 {{ answers.length }}개</span>
      </div>

      <div class="relative mx-auto w-full max-w-md" :style="{ aspectRatio: `${VB_W} / ${VB_H}` }">
        <svg :viewBox="`0 0 ${VB_W} ${VB_H}`" class="absolute inset-0 h-full w-full" aria-hidden="true">
          <!-- 해 & 구름 -->
          <circle cx="282" cy="34" r="16" fill="#FFF1A8" stroke="#3D3552" stroke-width="2.5" />
          <g fill="#fff" stroke="#3D3552" stroke-width="2.5">
            <ellipse cx="38" cy="36" rx="22" ry="10" />
          </g>
          <!-- 땅 -->
          <ellipse cx="160" cy="262" rx="132" ry="14" fill="#CDEFD9" stroke="#3D3552" stroke-width="2.5" />
          <!-- 줄기 & 가지 -->
          <path d="M138 263 C146 232 148 204 146 168 L174 168 C172 204 174 232 182 263 Z" fill="#D9A877" stroke="#3D3552" stroke-width="3" stroke-linejoin="round" />
          <path d="M152 236 q4 -8 0 -16 M168 214 q-4 -8 0 -14" fill="none" stroke="#3D3552" stroke-width="2" stroke-linecap="round" opacity=".5" />
          <!-- 수관: 테두리 원을 먼저, 같은 원을 테두리 없이 위에 덮어 구름 모양 외곽선만 남겨요 -->
          <g fill="#3D3552">
            <circle cx="160" cy="98" r="73" /><circle cx="98" cy="122" r="53" /><circle cx="222" cy="122" r="53" />
            <circle cx="118" cy="70" r="48" /><circle cx="202" cy="70" r="48" /><circle cx="160" cy="144" r="58" />
            <circle cx="70" cy="154" r="35" /><circle cx="250" cy="154" r="35" />
          </g>
          <g fill="#8FD9A8">
            <circle cx="160" cy="98" r="70" /><circle cx="98" cy="122" r="50" /><circle cx="222" cy="122" r="50" />
            <circle cx="118" cy="70" r="45" /><circle cx="202" cy="70" r="45" /><circle cx="160" cy="144" r="55" />
            <circle cx="70" cy="154" r="32" /><circle cx="250" cy="154" r="32" />
          </g>
          <g fill="#CDEFD9" opacity=".9">
            <circle cx="104" cy="58" r="10" /><circle cx="122" cy="46" r="5" /><circle cx="66" cy="140" r="6" /><circle cx="212" cy="50" r="6" />
          </g>
        </svg>

        <!-- 열매 -->
        <button
          v-for="f in fruits"
          :key="f.id"
          type="button"
          class="fruit absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink shadow-pop-sm transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-deep/40"
          :class="[fresh.has(f.id) ? 'fruit-pop' : '', mine.has(f.id) ? 'ring-2 ring-white ring-offset-2 ring-offset-ink' : '', selected?.id === f.id ? 'scale-125' : '']"
          :style="{ left: `${f.left}%`, top: `${f.top}%`, background: f.color, '--tilt': `${f.tilt}deg` }"
          :aria-label="`${f.nickname}의 열매 열어 보기`"
          @click="selected = selected?.id === f.id ? null : f"
        >
          <span class="fruit-leaf" aria-hidden="true"></span>
          <span class="fruit-shine" aria-hidden="true"></span>
        </button>

        <!-- 열매 바구니 (나무에 다 못 단 열매) -->
        <button
          v-if="extra > 0"
          type="button"
          class="btn absolute bottom-[3%] right-[4%] bg-peach px-2.5 py-1 text-sm"
          @click="showAll = !showAll"
        >
          🧺 +{{ extra }}
        </button>

        <!-- 열매를 누르면 나오는 작은 쪽지 -->
        <Transition name="note">
          <div
            v-if="selected"
            class="card absolute inset-x-3 z-10 bg-cream p-4 text-left"
            :class="selected.top > 42 ? 'top-3' : 'bottom-3'"
            role="dialog"
            :aria-label="`${selected.nickname}의 생각`"
          >
            <div class="mb-1.5 flex items-center justify-between gap-2">
              <span class="chip text-sm" :style="{ background: selected.color }">🍎 {{ selected.nickname }}</span>
              <span class="flex items-center gap-2 text-xs text-ink/60">
                {{ selected.demo ? '예시 열매' : timeLabel(selected.created_at) }}
                <button type="button" class="rounded-full border-2 border-ink bg-white px-2 font-jua text-sm leading-6" aria-label="닫기" @click="selected = null">✕</button>
              </span>
            </div>
            <p class="max-h-32 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">{{ selected.body }}</p>
          </div>
        </Transition>
      </div>

      <p class="px-4 pb-3 text-center text-xs text-ink/70">
        <template v-if="mode === 'loading'">나무를 깨우는 중…</template>
        <template v-else-if="mode === 'local'">🌱 연습 모드: 지금은 내 열매가 이 기기에만 보여요.</template>
        <template v-else-if="!answers.length">아직 열매가 없어요. 첫 열매를 달아 볼까요?</template>
        <template v-else>열매를 눌러 친구의 생각을 읽어 보세요.</template>
      </p>
    </div>

    <!-- 모든 열매 목록 -->
    <ul v-if="showAll" class="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1">
      <li v-for="a in [...answers].reverse()" :key="a.id" class="rounded-2xl border-2 border-ink bg-white px-3 py-2 text-sm">
        <b class="font-jua">{{ a.nickname }}</b>
        <span class="ml-1 text-xs text-ink/60">{{ timeLabel(a.created_at) }}</span>
        <p class="whitespace-pre-wrap break-words">{{ a.body }}</p>
      </li>
    </ul>

    <!-- 내 열매 달기 -->
    <form class="mt-4 grid gap-2" @submit.prevent="submit">
      <div class="grid grid-cols-[minmax(0,9rem)_1fr] items-end gap-2">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-ink/80">별명</span>
          <input
            v-model="nickname"
            :maxlength="NICK_MAX"
            placeholder="예: 별빛토끼"
            autocomplete="off"
            class="w-full rounded-2xl border-2 border-ink bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-pink-deep/30"
          />
        </label>
        <p class="pb-2 text-xs leading-snug text-ink/70">진짜 이름 대신 <b>별명</b>으로 적어요.</p>
      </div>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-ink/80">내 생각</span>
        <textarea
          v-model="body"
          rows="3"
          :maxlength="BODY_MAX"
          placeholder="떠오르는 생각을 자유롭게 적어 보세요."
          class="w-full resize-none rounded-2xl border-2 border-ink bg-white px-4 py-3 text-base leading-relaxed outline-none focus:ring-4 focus:ring-pink-deep/30"
        />
      </label>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs text-ink/70">친구가 읽어도 기분 좋은 고운 말로 · 전화번호 같은 개인 정보는 쓰지 않기 · {{ body.length }}/{{ BODY_MAX }}</span>
        <button type="submit" class="btn bg-pink-deep text-white disabled:cursor-not-allowed disabled:opacity-50" :disabled="busy || cooldown || mode === 'loading'">
          🍎 {{ cooldown ? '잠깐 쉬었다가!' : '열매 달기' }}
        </button>
      </div>
      <p v-if="notice" class="font-jua text-sm text-ink" role="status">{{ notice }}</p>
    </form>
  </div>
</template>

<style scoped>
.fruit {
  width: clamp(18px, 6.5%, 28px);
  aspect-ratio: 1;
}
.fruit-leaf {
  position: absolute;
  top: -7px;
  left: 50%;
  width: 9px;
  height: 6px;
  background: #5fc48c;
  border: 1.5px solid #3d3552;
  border-radius: 0 100% 0 100%;
  transform: translateX(-10%) rotate(var(--tilt));
}
.fruit-shine {
  position: absolute;
  top: 22%;
  left: 24%;
  width: 26%;
  height: 22%;
  border-radius: 999px;
  background: #ffffffb3;
}
.fruit-pop {
  animation: pop 0.6s cubic-bezier(0.3, 1.6, 0.5, 1) backwards;
}
@keyframes pop {
  from {
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    transform: translate(-50%, -50%) scale(1);
  }
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}
.note-enter-from,
.note-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .fruit-pop {
    animation: none;
  }
}
</style>
