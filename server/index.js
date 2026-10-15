// 짱하연T의 국어 탐구소 · 작은 Node(Express) 콘텐츠 서버
// - GET  /api/content              : src/data/content.json + 저장된 좋아요 수
// - POST /api/assessments/:id/like : 수행평가 작품 좋아요 +1 (server/likes.json 에 저장)
// - 그 밖의 주소                    : 빌드된 dist/ 정적 파일
// content.json 을 고치면 다시 빌드하지 않아도 새로고침만으로 반영돼요.
import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(root, 'src/data/content.json');
const LIKES = path.join(root, 'server/likes.json');
const PORT = process.env.PORT || 3001;

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const app = express();

app.get('/api/content', async (_req, res) => {
  const content = await readJson(CONTENT, null);
  if (!content) return res.status(500).json({ error: 'content.json 을 읽을 수 없어요' });
  const likes = await readJson(LIKES, {});
  content.assessments = content.assessments.map((a) => ({ ...a, likes: a.likes + (likes[a.id] || 0) }));
  res.json(content);
});

app.post('/api/assessments/:id/like', async (req, res) => {
  const likes = await readJson(LIKES, {});
  likes[req.params.id] = (likes[req.params.id] || 0) + 1;
  await writeFile(LIKES, JSON.stringify(likes, null, 2));
  res.json({ id: req.params.id, added: likes[req.params.id] });
});

app.use(express.static(path.join(root, 'dist')));

app.listen(PORT, () => console.log(`🔎 국어 탐구소 서버: http://localhost:${PORT}`));
