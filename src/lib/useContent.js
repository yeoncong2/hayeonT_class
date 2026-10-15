import { useEffect, useState } from 'react';
import bundled from '../data/content.json';

// Node 콘텐츠 서버(server/index.js)가 켜져 있으면 거기서 최신 내용을 받고,
// 서버 없이 정적으로 열면 빌드에 들어 있는 content.json 을 그대로 씁니다.
export default function useContent() {
  const [content, setContent] = useState(bundled);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('./api/content')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : Promise.reject()))
      .then((data) => {
        if (alive) {
          setContent(data);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return { content, live };
}

export function sendLike(id) {
  return fetch(`./api/assessments/${encodeURIComponent(id)}/like`, { method: 'POST' }).catch(() => null);
}
