import { useCallback, useEffect, useState } from 'react';
import { deleteAnswer, fetchRecentAnswers } from '../lib/answers';

// #admin 에서 선생님이 "생각 나무" 열매(학생 답)를 살펴보고 지우는 곳
export default function AnswerAdmin() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  const reload = useCallback(
    () =>
      fetchRecentAnswers()
        .then((r) => {
          setRows(r);
          setMsg('');
        })
        .catch((e) => setMsg('열매를 불러오지 못했어요. supabase/schema.sql 의 6번을 실행했는지 확인해 주세요. (' + e.message + ')')),
    [],
  );
  useEffect(() => {
    reload();
  }, [reload]);

  const remove = async (r) => {
    if (!window.confirm(`"${r.nickname}" 학생의 열매를 지울까요?\n\n${r.body}`)) return;
    try {
      await deleteAnswer(r.id);
      setRows((list) => list.filter((x) => x.id !== r.id));
    } catch (e) {
      setMsg('삭제 실패: ' + e.message);
    }
  };

  // 날짜별로 묶어서 보여 줘요.
  const days = rows.reduce((acc, r) => {
    (acc[r.question_key] ||= []).push(r);
    return acc;
  }, {});

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl">오늘의 질문 열매 🍎 ({rows.length})</h2>
        <button onClick={reload} className="rounded-full border-2 border-ink bg-white px-3 font-jua text-sm">새로고침</button>
      </div>
      <p className="mt-1 text-sm text-ink/70">최근 200개까지 보여요. 고운 말이 아니거나 개인 정보가 담긴 열매는 지워 주세요.</p>
      {msg && <p className="card my-3 p-3 font-jua text-sm">{msg}</p>}
      {Object.entries(days).map(([day, list]) => (
        <div key={day} className="mt-4">
          <h3 className="font-jua text-lg">{day}</h3>
          {list[0]?.question && <p className="mb-2 text-sm text-ink/70">Q. {list[0].question}</p>}
          <ul className="grid gap-2">
            {list.map((r) => (
              <li key={r.id} className="card flex items-start justify-between gap-3 p-3">
                <span className="min-w-0">
                  <b>{r.nickname}</b>{' '}
                  <small className="text-ink/60">{new Date(r.created_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}</small>
                  <span className="block whitespace-pre-wrap break-words">{r.body}</span>
                </span>
                <button onClick={() => remove(r)} className="shrink-0 rounded-full border-2 border-ink bg-pink px-3 font-jua text-sm">삭제</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
