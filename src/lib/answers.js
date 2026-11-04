import { supabase } from './supabase';

// "오늘의 질문" 답 = 나무의 열매. Supabase 표 question_answers 에 저장해요.
// 표가 아직 없거나 인터넷이 끊기면 이 기기(localStorage)에만 저장하는 연습 모드로 바뀌어요.

export const NICK_MAX = 12;
export const BODY_MAX = 200;
const TABLE = 'question_answers';

const pad = (n) => String(n).padStart(2, '0');
export const dayKeyOf = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---- 입력 다듬기 & 안전 검사 -------------------------------------------------
// 태그·꺾쇠는 지우고, 공백을 정리해요. (화면에는 항상 글자 그대로 보여 주므로 HTML 로 실행되지 않아요.)
export function clean(text, max) {
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

// 고운 말 지킴이: 흔한 욕설만 간단히 걸러요. (완벽하지 않으니 선생님이 #admin 에서 지울 수 있어요.)
const BAD = [
  '시발', '씨발', '씨빨', '시바', '씨바', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '븅신', '개새', '개세', '새끼', 'ㅅㄲ',
  '좆', 'ㅈㄹ', '지랄', '미친놈', '미친년', '닥쳐', '꺼져', '엠창', '느금', '니애미', '애미', '패드립',
  'fuck', 'shit', 'bitch',
];
const squash = (s) => s.toLowerCase().replace(/[\s.,!?~\-_*0-9]/g, '');
const PHONE = /01[016789][\s.-]?\d{3,4}[\s.-]?\d{4}/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;

// 문제가 있으면 학생에게 보여 줄 안내 문장을, 괜찮으면 '' 를 돌려줘요.
export function checkAnswer(nickname, body) {
  if (!nickname) return '별명을 적어 주세요. (진짜 이름 대신 별명!)';
  if (!body) return '내 생각을 한 줄이라도 적어 주세요.';
  const all = squash(nickname + body);
  if (BAD.some((w) => all.includes(w))) return '고운 말로 다시 적어 볼까요? 🌱';
  if (PHONE.test(nickname + ' ' + body) || EMAIL.test(nickname + ' ' + body))
    return '전화번호·이메일 같은 개인 정보는 적지 않아요.';
  return '';
}

// ---- 서버(Supabase) ----------------------------------------------------------
export async function fetchAnswers(questionKey) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nickname, body, created_at')
    .eq('question_key', questionKey)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function postAnswer({ questionKey, question, nickname, body }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ question_key: questionKey, question: question.slice(0, 300), nickname, body })
    .select('id, nickname, body, created_at')
    .single();
  if (error) throw error;
  return data;
}

// 선생님용 (#admin, 로그인한 상태에서만 동작)
export async function fetchRecentAnswers(limit = 200) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
export async function deleteAnswer(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

// ---- 연습 모드(이 기기에만) ----------------------------------------------------
const localKey = (k) => `answer-tree-${k}`;
export function readLocal(questionKey) {
  try {
    return JSON.parse(localStorage.getItem(localKey(questionKey)) || '[]');
  } catch {
    return [];
  }
}
export function saveLocal(questionKey, list) {
  try {
    localStorage.setItem(localKey(questionKey), JSON.stringify(list.slice(-60)));
  } catch {}
}

// 서버 연결 전에도 나무가 허전하지 않게 보여 주는 예시 열매 (저장되지 않아요)
export const DEMO = [
  { id: 'demo-1', nickname: '하연샘', body: '첫 열매는 선생님이 달아 둘게요. 여러분의 생각으로 나무를 채워 주세요! 🍎', created_at: null, demo: true },
];
