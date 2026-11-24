-- EvoFit Pro 2: additive migration. Does not delete or replace existing snapshots.
-- Run schema.sql first on a new installation. Re-running this migration is safe.
begin;

alter table public.app_snapshots add column if not exists revision bigint not null default 0;
create or replace function public.handle_app_snapshots_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.revision = old.revision + 1;
  return new;
end;
$$;

create table if not exists public.student_portal_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  invited_email text not null,
  token_hash text not null unique,
  student_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  unique(owner_id, student_id)
);
create index if not exists student_portal_user_idx on public.student_portal_access(student_user_id);
create table if not exists public.student_portal_events (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_role text not null check(author_role in ('coach','student')),
  kind text not null check(kind in ('workout','checkin','message')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists student_portal_events_owner_idx on public.student_portal_events(owner_id,student_id,created_at);
create unique index if not exists student_workout_once_daily on public.student_portal_events(owner_id,student_id,(payload->>'date'),(payload->>'workoutId')) where kind='workout';

alter table public.student_portal_access enable row level security;
alter table public.student_portal_events enable row level security;
drop policy if exists coach_reads_own_portals on public.student_portal_access;
create policy coach_reads_own_portals on public.student_portal_access for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists coach_reads_own_events on public.student_portal_events;
create policy coach_reads_own_events on public.student_portal_events for select to authenticated using(owner_id=(select auth.uid()));
revoke all on public.student_portal_access, public.student_portal_events from anon, authenticated;
grant select on public.student_portal_access, public.student_portal_events to authenticated;

-- Serialized compare-and-swap prevents two devices from silently overwriting each other.
create or replace function public.save_coach_snapshot(p_payload jsonb, p_expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; result_revision bigint;
begin
  if auth.uid() is null then raise exception 'Acesso não autorizado.' using errcode='42501'; end if;
  if jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text)>10000000 then raise exception 'Dados inválidos ou muito grandes.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select revision into current_revision from public.app_snapshots where user_id=auth.uid() for update;
  if current_revision is distinct from p_expected_revision then raise exception 'Os dados foram alterados em outro dispositivo. Exporte uma cópia local antes de recarregar.' using errcode='40001'; end if;
  if current_revision is null then
    insert into public.app_snapshots(user_id,payload) values(auth.uid(),p_payload) returning revision into result_revision;
  else
    update public.app_snapshots set payload=p_payload where user_id=auth.uid() returning revision into result_revision;
  end if;
  return result_revision;
end;
$$;

create or replace function public.create_student_invite(p_student_id text,p_email text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare token text; result public.student_portal_access; stored_student jsonb;
begin
  if auth.uid() is null then raise exception 'Entre na conta do personal.' using errcode='42501'; end if;
  select s into stored_student from public.app_snapshots a, lateral jsonb_array_elements(a.payload->'evofit_students_v2') s where a.user_id=auth.uid() and s->>'id'=p_student_id;
  if stored_student is null then raise exception 'Salve o cadastro do aluno antes de criar o convite.'; end if;
  if lower(trim(coalesce(stored_student->>'email',''))) <> lower(trim(p_email)) or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Use o e-mail salvo no cadastro do aluno.'; end if;
  token := gen_random_uuid()::text || gen_random_uuid()::text;
  insert into public.student_portal_access(owner_id,student_id,invited_email,token_hash)
  values(auth.uid(),p_student_id,lower(trim(p_email)),encode(sha256(convert_to(token,'UTF8')),'hex'))
  on conflict(owner_id,student_id) do update set invited_email=excluded.invited_email,token_hash=excluded.token_hash,student_user_id=null,revoked=false,expires_at=now()+interval '7 days'
  returning * into result;
  return jsonb_build_object('id',result.id,'token',token,'expires_at',result.expires_at,'invited_email',result.invited_email);
end;
$$;

create or replace function public.revoke_student_access(p_student_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Entre na conta do personal.' using errcode='42501'; end if;
  update public.student_portal_access set revoked=true where owner_id=auth.uid() and student_id=p_student_id;
end;
$$;

create or replace function public.accept_student_invite(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare invitation public.student_portal_access;
begin
  if auth.uid() is null then raise exception 'Entre com seu e-mail e senha.' using errcode='42501'; end if;
  if length(p_token)<>72 then raise exception 'Convite inválido.'; end if;
  select * into invitation from public.student_portal_access where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
  if invitation.id is null or invitation.revoked then raise exception 'Convite inválido ou revogado. Peça um novo link ao seu personal.'; end if;
  if invitation.student_user_id=auth.uid() then return invitation.id; end if;
  if invitation.expires_at<now() then raise exception 'Este convite expirou. Peça um novo link ao seu personal.'; end if;
  if invitation.student_user_id is not null or invitation.invited_email<>lower(coalesce(auth.jwt()->>'email','')) then raise exception 'Entre com o e-mail autorizado pelo seu personal.' using errcode='42501'; end if;
  if invitation.owner_id=auth.uid() then raise exception 'Abra este convite com a conta do aluno.'; end if;
  update public.student_portal_access set student_user_id=auth.uid() where id=invitation.id;
  return invitation.id;
end;
$$;

create or replace function public.my_student_portals()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'student_name',s->>'nome','coach_name',a.payload->'evofit_profile_v2'->>'personalNome')),'[]'::jsonb)
  from public.student_portal_access p join public.app_snapshots a on a.user_id=p.owner_id,
  lateral jsonb_array_elements(a.payload->'evofit_students_v2') s
  where p.student_user_id=auth.uid() and not p.revoked and s->>'id'=p.student_id and coalesce(s->>'status','Ativo')<>'Inativo';
$$;

create or replace function public.get_student_portal(p_access_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare access public.student_portal_access; snapshot jsonb; student jsonb; result jsonb;
begin
  select * into access from public.student_portal_access where id=p_access_id and student_user_id=auth.uid() and not revoked;
  if access.id is null then raise exception 'Este acompanhamento não está disponível para sua conta.' using errcode='42501'; end if;
  select payload into snapshot from public.app_snapshots where user_id=access.owner_id;
  select s into student from jsonb_array_elements(snapshot->'evofit_students_v2') s where s->>'id'=access.student_id;
  if student is null or coalesce(student->>'status','Ativo')='Inativo' then raise exception 'Acompanhamento indisponível. Converse com seu personal.'; end if;
  -- Explicit allowlist: internal coach notes never leave the database.
  select jsonb_object_agg(key,value) into result from jsonb_each(student) where key=any(array['id','nome','email','plano','objetivo','status','academia','restricoes','entrada','metaSemanal','focoDoCiclo','mensagemPersonal']);
  result:=jsonb_build_object('student',result,'profile',coalesce((select jsonb_object_agg(key,value) from jsonb_each(snapshot->'evofit_profile_v2') where key=any(array['personalNome','nomeNegocio','whatsapp','mensagemBoasVindas'])),'{}'::jsonb));
  result:=result || jsonb_build_object(
    'workouts',coalesce((select jsonb_agg(w) from jsonb_array_elements(coalesce(snapshot->'evofit_workouts_v2','[]')) w where w->>'alunoId'=access.student_id and coalesce(w->>'status','Ativo')<>'Inativo'),'[]'::jsonb),
    'evaluations',coalesce((select jsonb_agg((select jsonb_object_agg(key,value) from jsonb_each(e) where key=any(array['id','alunoId','data','peso','gordura','cintura','peito','quadril']))) from jsonb_array_elements(coalesce(snapshot->'evofit_evaluations_v2','[]')) e where e->>'alunoId'=access.student_id),'[]'::jsonb),
    'payments',coalesce((select jsonb_agg(p) from jsonb_array_elements(coalesce(snapshot->'evofit_payments_v2','[]')) p where p->>'alunoId'=access.student_id),'[]'::jsonb),
    'agenda',coalesce((select jsonb_agg(p) from jsonb_array_elements(coalesce(snapshot->'evofit_agenda_v2','[]')) p where p->>'alunoId'=access.student_id),'[]'::jsonb),
    'checkins',coalesce((select jsonb_agg(p) from jsonb_array_elements(coalesce(snapshot->'evofit_checkins_v2','[]')) p where p->>'alunoId'=access.student_id),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'alunoId',e.student_id,'kind',e.kind,'payload',e.payload,'author',e.author_role,'created_at',e.created_at) order by e.created_at) from public.student_portal_events e where e.owner_id=access.owner_id and e.student_id=access.student_id),'[]'::jsonb)
  );
  return result;
end;
$$;

create schema if not exists evofit_private;
revoke all on schema evofit_private from public,anon,authenticated;
create or replace function evofit_private.validate_event(p_owner uuid,p_student text,p_kind text,p_payload jsonb)
returns void language plpgsql set search_path = '' as $$
declare item jsonb; series jsonb;
begin
  if p_kind not in ('message','checkin','workout') or p_kind is null or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>100000 then raise exception 'Registro inválido.'; end if;
  if p_kind='message' then
    if jsonb_typeof(p_payload->'text') is distinct from 'string' or length(trim(p_payload->>'text')) not between 1 and 2000 then raise exception 'A mensagem deve ter de 1 a 2000 caracteres.'; end if;
    return;
  end if;
  if coalesce(p_payload->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Data inválida.'; end if;
  if abs((p_payload->>'date')::date-current_date)>1 then raise exception 'Registre a atividade no dia em que ela aconteceu.'; end if;
  if length(coalesce(p_payload->>'note',''))>1000 then raise exception 'Observação muito longa.'; end if;
  if p_kind='checkin' then
    if jsonb_typeof(p_payload->'energy') is distinct from 'number' or (p_payload->>'energy')::numeric not between 1 and 5 or (p_payload->>'energy')::numeric<>trunc((p_payload->>'energy')::numeric) then raise exception 'Energia inválida.'; end if;
    if jsonb_typeof(p_payload->'sleep') is distinct from 'number' or (p_payload->>'sleep')::numeric not between 0 and 24 then raise exception 'Horas de sono inválidas.'; end if;
    if coalesce(p_payload->>'mood','') not in ('Muito bem','Bem','Cansado(a)','Com desconforto') then raise exception 'Informe como você se sente.'; end if;
    return;
  end if;
  if not exists(select 1 from public.app_snapshots a,lateral jsonb_array_elements(a.payload->'evofit_workouts_v2') w where a.user_id=p_owner and w->>'alunoId'=p_student and w->>'id'=p_payload->>'workoutId' and coalesce(w->>'status','Ativo')<>'Inativo') then raise exception 'Este treino não pertence ao aluno ou não está mais ativo.'; end if;
  if coalesce(p_payload->>'duration','') !~ '^\d+$' or (p_payload->>'duration')::integer not between 1 and 1440 then raise exception 'Duração inválida.'; end if;
  if coalesce(p_payload->>'effort','') !~ '^\d+$' or (p_payload->>'effort')::integer not between 1 and 10 then raise exception 'Esforço inválido.'; end if;
  if jsonb_typeof(p_payload->'exercises') is distinct from 'array' then raise exception 'Informe os exercícios concluídos.'; end if;
  if jsonb_array_length(p_payload->'exercises') not between 1 and 50 then raise exception 'Lista de exercícios inválida.'; end if;
  for item in select value from jsonb_array_elements(p_payload->'exercises') loop
    if jsonb_typeof(item->'sets') is distinct from 'array' then raise exception 'Séries inválidas.'; end if;
    if jsonb_array_length(item->'sets') not between 1 and 12 then raise exception 'Séries inválidas.'; end if;
    for series in select value from jsonb_array_elements(item->'sets') loop
      if series->'done' is distinct from 'true'::jsonb then raise exception 'Marque todas as séries antes de concluir.'; end if;
      if length(coalesce(series->>'reps',''))>60 then raise exception 'Repetições inválidas.'; end if;
      if coalesce(series->>'kg','')<>'' then
        if (series->>'kg') !~ '^\d+(\.\d+)?$' then raise exception 'Carga inválida.'; end if;
        if (series->>'kg')::numeric not between 0 and 1000 then raise exception 'Carga inválida.'; end if;
      end if;
    end loop;
  end loop;
end;
$$;

create or replace function public.submit_student_event(p_access_id uuid,p_id uuid,p_kind text,p_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare access public.student_portal_access;
begin
  -- Row lock serializes revocation against a concurrent student write.
  select * into access from public.student_portal_access where id=p_access_id and student_user_id=auth.uid() and not revoked for share;
  if access.id is null then raise exception 'Acesso não autorizado ou revogado.' using errcode='42501'; end if;
  if not exists(select 1 from public.app_snapshots a,lateral jsonb_array_elements(a.payload->'evofit_students_v2') s where a.user_id=access.owner_id and s->>'id'=access.student_id and coalesce(s->>'status','Ativo')<>'Inativo') then raise exception 'Acompanhamento indisponível.' using errcode='42501'; end if;
  perform evofit_private.validate_event(access.owner_id,access.student_id,p_kind,p_payload);
  insert into public.student_portal_events(id,owner_id,student_id,author_id,author_role,kind,payload) values(p_id,access.owner_id,access.student_id,auth.uid(),'student',p_kind,p_payload) on conflict do nothing;
end;
$$;

create or replace function public.record_coach_event(p_student_id text,p_id uuid,p_kind text,p_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.app_snapshots a,lateral jsonb_array_elements(a.payload->'evofit_students_v2') s where a.user_id=auth.uid() and s->>'id'=p_student_id) then raise exception 'Aluno indisponível nesta conta.' using errcode='42501'; end if;
  perform evofit_private.validate_event(auth.uid(),p_student_id,p_kind,p_payload);
  insert into public.student_portal_events(id,owner_id,student_id,author_id,author_role,kind,payload) values(p_id,auth.uid(),p_student_id,auth.uid(),'coach',p_kind,p_payload) on conflict do nothing;
end;
$$;

create or replace function public.send_coach_message(p_student_id text,p_id uuid,p_text text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.record_coach_event(p_student_id,p_id,'message',jsonb_build_object('text',p_text));
end;
$$;

-- No anonymous execution. Every entry point validates authenticated ownership/membership.
revoke all on function public.save_coach_snapshot(jsonb,bigint), public.create_student_invite(text,text), public.revoke_student_access(text), public.accept_student_invite(text), public.my_student_portals(), public.get_student_portal(uuid), public.submit_student_event(uuid,uuid,text,jsonb), public.record_coach_event(text,uuid,text,jsonb), public.send_coach_message(text,uuid,text) from public,anon;
grant execute on function public.save_coach_snapshot(jsonb,bigint), public.create_student_invite(text,text), public.revoke_student_access(text), public.accept_student_invite(text), public.my_student_portals(), public.get_student_portal(uuid), public.submit_student_event(uuid,uuid,text,jsonb), public.record_coach_event(text,uuid,text,jsonb), public.send_coach_message(text,uuid,text) to authenticated;
commit;
