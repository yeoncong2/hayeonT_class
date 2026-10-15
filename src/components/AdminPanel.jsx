import { useCallback, useEffect, useState } from 'react';
import { BUCKET, fetchAssessments, supabase } from '../lib/supabase';
import { FILE_TYPE } from './AssessmentGallery';

const COLORS = ['pink', 'peach', 'butter', 'mint', 'sky', 'lilac'];
const EMPTY = { grade: 1, semester: 1, unit: '', kind: 'process', title: '', description: '', author: '', emoji: '📄', color: 'sky' };

const guessType = (url) => {
  const u = url.toLowerCase();
  if (u.includes('docs.google.com/spreadsheets') || u.includes('.xlsx')) return 'sheet';
  if (u.includes('docs.google.com/presentation') || u.includes('.pptx')) return 'slide';
  if (u.includes('docs.google.com/document') || u.includes('.docx') || u.includes('.hwp')) return 'doc';
  if (u.includes('.pdf')) return 'pdf';
  if (/\.(png|jpe?g|gif|webp)(\?|$)/.test(u)) return 'image';
  return 'link';
};
const typeFromFile = (f) => {
  if (f.type === 'application/pdf') return 'pdf';
  if (f.type.startsWith('image/')) return 'image';
  return guessType(f.name);
};

const inputCls = 'w-full rounded-xl border-2 border-ink bg-white px-3 py-2';

export default function AdminPanel() {
  const [session, setSession] = useState(undefined);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState([]); // 새 게시물에 붙일 자료들 {type,label,url,storage_path}
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => fetchAssessments().then(setItems).catch((e) => setMsg(e.message)), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session) reload();
  }, [session, reload]);

  const signIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword(login);
    setMsg(error ? '로그인 실패: ' + error.message : '');
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.trim();
    setPending((p) => [...p, { type: guessType(url), label: linkLabel.trim(), url }]);
    setLinkUrl('');
    setLinkLabel('');
  };

  const addFiles = async (fileList) => {
    setBusy(true);
    setMsg('파일 올리는 중…');
    try {
      const added = [];
      for (const f of fileList) {
        const ext = (f.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type || undefined });
        if (error) throw error;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        added.push({ type: typeFromFile(f), label: f.name.replace(/\.[^.]+$/, ''), url: data.publicUrl, storage_path: path });
      }
      setPending((p) => [...p, ...added]);
      setMsg(`${added.length}개 파일을 올렸어요.`);
    } catch (e) {
      setMsg('업로드 실패: ' + e.message);
    }
    setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.unit.trim()) return setMsg('단원과 제목은 꼭 적어 주세요.');
    setBusy(true);
    const { data, error } = await supabase.from('assessments').insert(form).select().single();
    if (error) {
      setBusy(false);
      return setMsg('저장 실패: ' + error.message);
    }
    if (pending.length) {
      const { error: fe } = await supabase
        .from('assessment_files')
        .insert(pending.map((f, i) => ({ ...f, assessment_id: data.id, sort_order: i })));
      if (fe) setMsg('게시물은 저장됐지만 자료 저장 실패: ' + fe.message);
      else setMsg('저장했어요! 전시관에 바로 보입니다.');
    } else setMsg('저장했어요! 전시관에 바로 보입니다.');
    setForm({ ...EMPTY, grade: form.grade, semester: form.semester, unit: form.unit, kind: form.kind });
    setPending([]);
    setBusy(false);
    reload();
  };

  const togglePublish = async (it) => {
    await supabase.from('assessments').update({ published: !it.published }).eq('id', it.id);
    reload();
  };
  const remove = async (it) => {
    if (!window.confirm(`"${it.title}" 게시물과 붙은 자료를 삭제할까요?`)) return;
    const paths = it.files.map((f) => f.storage_path).filter(Boolean);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('assessments').delete().eq('id', it.id);
    reload();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: ['grade', 'semester'].includes(k) ? Number(e.target.value) : e.target.value }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-sans">
      <a href="#" className="font-jua underline" onClick={() => (window.location.hash = '')}>
        ← 전시관으로 돌아가기
      </a>
      <h1 className="mt-3 text-3xl">수행평가 올리기 ✍️</h1>
      {msg && <p className="card my-4 p-3 font-jua">{msg}</p>}

      {session === undefined ? null : !session ? (
        <form onSubmit={signIn} className="card mt-4 grid gap-3 p-5">
          <p className="font-jua text-lg">선생님 로그인</p>
          <input className={inputCls} type="email" placeholder="이메일" autoComplete="username" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
          <input className={inputCls} type="password" placeholder="비밀번호" autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          <button className="rounded-full border-2 border-ink bg-butter px-4 py-2 font-jua shadow-pop-sm">로그인</button>
        </form>
      ) : (
        <>
          <form onSubmit={save} className="card mt-4 grid gap-3 p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label>학년<select className={inputCls} value={form.grade} onChange={set('grade')}>{[1, 2, 3].map((g) => <option key={g} value={g}>{g}학년</option>)}</select></label>
              <label>학기<select className={inputCls} value={form.semester} onChange={set('semester')}>{[1, 2].map((s) => <option key={s} value={s}>{s}학기</option>)}</select></label>
              <label>종류<select className={inputCls} value={form.kind} onChange={set('kind')}><option value="process">과정물</option><option value="result">결과물</option></select></label>
              <label>색<select className={inputCls} value={form.color} onChange={set('color')}>{COLORS.map((c) => <option key={c}>{c}</option>)}</select></label>
            </div>
            <label>단원<input className={inputCls} placeholder="예: 4. 성장의 시간" value={form.unit} onChange={set('unit')} /></label>
            <label>제목<input className={inputCls} value={form.title} onChange={set('title')} /></label>
            <label>설명<textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} /></label>
            <div className="grid grid-cols-[1fr_5rem] gap-3">
              <label>작성자<input className={inputCls} placeholder="예: 1학년 3반 모둠 4" value={form.author} onChange={set('author')} /></label>
              <label>이모지<input className={inputCls} value={form.emoji} onChange={set('emoji')} /></label>
            </div>

            <fieldset className="grid gap-2 rounded-2xl border-2 border-dashed border-ink p-3">
              <legend className="px-2 font-jua">자료 붙이기</legend>
              <div className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
                <input className={inputCls} placeholder="구글 시트·문서·PDF 링크 붙여넣기" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <input className={inputCls} placeholder="버튼 이름(선택)" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
                <button type="button" onClick={addLink} className="rounded-full border-2 border-ink bg-mint px-4 font-jua">링크 추가</button>
              </div>
              <label className="font-jua">
                또는 파일 직접 올리기 (PDF·사진 등, 20MB까지)
                <input className="mt-1 block" type="file" multiple disabled={busy} onChange={(e) => { addFiles([...e.target.files]); e.target.value = ''; }} />
              </label>
              {pending.length > 0 && (
                <ul className="mt-1 grid gap-1">
                  {pending.map((f, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-1 text-sm">
                      <span>{(FILE_TYPE[f.type] || FILE_TYPE.link).label} · {f.label || f.url.slice(0, 40)}</span>
                      <button type="button" onClick={() => setPending((p) => p.filter((_, j) => j !== i))} aria-label="빼기">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <button disabled={busy} className="rounded-full border-2 border-ink bg-pink px-4 py-2 font-jua text-lg shadow-pop-sm disabled:opacity-50">저장하기</button>
          </form>

          <h2 className="mt-10 text-2xl">올린 게시물 ({items.length})</h2>
          <ul className="mt-3 grid gap-2">
            {items.map((it) => (
              <li key={it.id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
                <span>
                  {it.emoji} <b>{it.title}</b> <small>· {it.grade}학년 {it.semester}학기 · {it.kind === 'process' ? '과정물' : '결과물'} · 자료 {it.files.length}개 {it.published ? '' : '· (숨김)'}</small>
                </span>
                <span className="flex gap-2 font-jua text-sm">
                  <button onClick={() => togglePublish(it)} className="rounded-full border-2 border-ink px-3">{it.published ? '숨기기' : '공개하기'}</button>
                  <button onClick={() => remove(it)} className="rounded-full border-2 border-ink bg-pink px-3">삭제</button>
                </span>
              </li>
            ))}
          </ul>
          <button onClick={() => supabase.auth.signOut()} className="mt-8 font-jua underline">로그아웃</button>
        </>
      )}
    </div>
  );
}
