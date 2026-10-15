import { useEffect, useState } from 'react';
import bundled from '../data/content.json';
import { fetchAssessments, supabase } from './supabase';

// 1) Node 콘텐츠 서버(server/index.js)가 켜져 있으면 거기서 최신 내용을 받고,
//    서버 없이 정적으로 열면 빌드에 들어 있는 content.json 을 그대로 씁니다.
// 2) 수행평가 게시물은 Supabase 에서 읽어 옵니다. 아직 하나도 없거나 연결이 안 되면 content.json 의 예시를 보여 줘요.
export default function useContent() {
  const [content, setContent] = useState(bundled);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('./api/content')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : Promise.reject()))
      .then((data) => {
        if (alive) {
          setContent((c) => ({ ...data, assessments: c.assessments }));
          setLive(true);
        }
      })
      .catch(() => {});
    fetchAssessments()
      .then((items) => {
        if (alive && items.length) setContent((c) => ({ ...c, assessments: items, fromDb: true }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return { content, live };
}

export function sendLike(id) {
  // DB 게시물(uuid)은 함수로 +1, 예시 게시물(a1…)은 기존 서버로 보냅니다.
  if (/^[0-9a-f-]{36}$/.test(id)) return supabase.rpc('like_assessment', { p_id: id }).then(() => null, () => null);
  return fetch(`./api/assessments/${encodeURIComponent(id)}/like`, { method: 'POST' }).catch(() => null);
}
