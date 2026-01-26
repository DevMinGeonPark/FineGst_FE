-- Push Tokens 테이블 생성
create table if not exists push_tokens (
  id uuid default gen_random_uuid() primary key,
  token text unique not null,
  platform text not null check (platform in ('ios', 'android')),
  device_id text,
  user_id text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 인덱스 생성
create index if not exists idx_push_tokens_user_id on push_tokens(user_id);
create index if not exists idx_push_tokens_is_active on push_tokens(is_active);

-- updated_at 자동 업데이트 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_push_tokens_updated_at
  before update on push_tokens
  for each row
  execute function update_updated_at_column();

-- RLS (Row Level Security) 활성화
alter table push_tokens enable row level security;

-- 서비스 롤용 정책 (Edge Functions에서 사용)
create policy "Service role can do everything" on push_tokens
  for all
  using (true)
  with check (true);
