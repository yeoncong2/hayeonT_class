import { createClient } from '@supabase/supabase-js';

// 공개해도 되는 주소와 publishable 키입니다. (쓰기 권한은 RLS 로 로그인한 선생님에게만 열려 있어요.)
// 다른 프로젝트로 바꿀 때는 .env 에 VITE_SUPABASE_URL, VITE_SUPABASE_KEY 를 넣으세요.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://vxibkqjikevjwicqzarj.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_HMc64M7BLAcAPNvUOFDErw_dmNXeQkC';

export const BUCKET = 'assessment-files';
export const supabase = createClient(URL, KEY);

// DB 행(assessments + assessment_files)을 화면에서 쓰는 모양으로 바꿉니다.
export function toItem(row) {
  return {
    id: row.id,
    grade: row.grade,
    semester: row.semester,
    unit: row.unit,
    kind: row.kind,
    title: row.title,
    desc: row.description,
    author: row.author,
    emoji: row.emoji,
    color: row.color,
    likes: row.likes,
    published: row.published,
    files: [...(row.assessment_files || [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function fetchAssessments() {
  const { data, error } = await supabase
    .from('assessments')
    .select('*, assessment_files(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toItem);
}
