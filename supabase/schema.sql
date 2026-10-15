-- 수행평가 과정물 & 결과물 데이터베이스
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여 넣고 Run 하면 됩니다. (여러 번 실행해도 안전)

-- 1) 수행평가 게시물 ------------------------------------------------------
create table if not exists public.assessments (
  id          uuid primary key default gen_random_uuid(),
  grade       smallint not null check (grade between 1 and 3),
  semester    smallint not null check (semester in (1, 2)),
  unit        text     not null,                                   -- 예: '4. 성장의 시간'
  kind        text     not null check (kind in ('process', 'result')), -- 과정물 / 결과물
  title       text     not null,
  description text     not null default '',
  author      text     not null default '',                        -- 예: '1학년 3반 모둠 4'
  emoji       text     not null default '📄',
  color       text     not null default 'sky',
  likes       integer  not null default 0,
  published   boolean  not null default true,                      -- false 로 두면 화면에서 숨김
  created_at  timestamptz not null default now()
);

-- 2) 게시물에 붙는 자료들 (PDF, 구글 시트 링크, 이미지, 기타 파일) ---------
create table if not exists public.assessment_files (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  type          text not null check (type in ('pdf', 'sheet', 'doc', 'slide', 'image', 'link', 'file')),
  label         text not null default '',        -- 버튼에 보일 이름
  url           text not null,                    -- 링크 주소 또는 저장소 공개 주소
  storage_path  text,                             -- 직접 올린 파일이면 저장소 안의 경로
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists assessments_filter_idx on public.assessments (grade, kind, created_at desc);
create index if not exists assessment_files_parent_idx on public.assessment_files (assessment_id, sort_order);

-- 3) 보안(RLS): 누구나 읽기, 쓰기는 로그인한 선생님만 ----------------------
alter table public.assessments      enable row level security;
alter table public.assessment_files enable row level security;

drop policy if exists "public read assessments" on public.assessments;
create policy "public read assessments" on public.assessments
  for select using (published = true or auth.role() = 'authenticated');

drop policy if exists "teacher write assessments" on public.assessments;
create policy "teacher write assessments" on public.assessments
  for all to authenticated using (true) with check (true);

drop policy if exists "public read files" on public.assessment_files;
create policy "public read files" on public.assessment_files
  for select using (
    exists (select 1 from public.assessments a
            where a.id = assessment_id and (a.published = true or auth.role() = 'authenticated'))
  );

drop policy if exists "teacher write files" on public.assessment_files;
create policy "teacher write files" on public.assessment_files
  for all to authenticated using (true) with check (true);

-- 4) 좋아요: 방문자가 likes 를 직접 고치지 못하게 함수로만 +1 ---------------
create or replace function public.like_assessment(p_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.assessments set likes = likes + 1
  where id = p_id and published = true
  returning likes;
$$;
revoke all on function public.like_assessment(uuid) from public;
grant execute on function public.like_assessment(uuid) to anon, authenticated;

-- 5) 파일 저장소: 공개 읽기, 업로드/삭제는 선생님만 (PDF 등 20MB 까지) -------
insert into storage.buckets (id, name, public, file_size_limit)
values ('assessment-files', 'assessment-files', true, 20971520)
on conflict (id) do update set public = true, file_size_limit = 20971520;

drop policy if exists "storage public read" on storage.objects;
create policy "storage public read" on storage.objects
  for select using (bucket_id = 'assessment-files');

drop policy if exists "storage teacher insert" on storage.objects;
create policy "storage teacher insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'assessment-files');

drop policy if exists "storage teacher update" on storage.objects;
create policy "storage teacher update" on storage.objects
  for update to authenticated using (bucket_id = 'assessment-files');

drop policy if exists "storage teacher delete" on storage.objects;
create policy "storage teacher delete" on storage.objects
  for delete to authenticated using (bucket_id = 'assessment-files');
