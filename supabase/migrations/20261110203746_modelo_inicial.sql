-- Marcaí: modelo de dados inicial (Etapa 1).
-- Regras gerais:
--   * toda tabela de negócio tem negocio_id e RLS que só deixa membros verem o próprio negócio;
--   * datas e horas em timestamptz; valores em centavos (inteiro);
--   * o acesso público (página /[slug], WhatsApp) passa pelo servidor com a service role.

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- Negócios e membros
-- ---------------------------------------------------------------------------

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  tipo text not null check (tipo in ('salao', 'manicure', 'estetica', 'barbearia', 'sobrancelha', 'outro')),
  endereco text,
  fuso text not null default 'America/Sao_Paulo',
  nome_atendente text not null default 'Lia' check (length(trim(nome_atendente)) between 1 and 40),
  tom_voz text,
  avisos text,
  cor_principal text not null default '#0F3D3E' check (cor_principal ~ '^#[0-9A-Fa-f]{6}$'),
  cor_destaque text not null default '#FFD23F' check (cor_destaque ~ '^#[0-9A-Fa-f]{6}$'),
  cantos text not null default 'suaves' check (cantos in ('retos', 'suaves', 'redondos')),
  fundo text not null default 'claro' check (fundo in ('claro', 'escuro')),
  whatsapp_phone_number_id text unique,
  criado_em timestamptz not null default now()
);

create table public.membros (
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  papel text not null default 'dono' check (papel in ('dono', 'equipe')),
  criado_em timestamptz not null default now(),
  primary key (negocio_id, user_id)
);
create index membros_user_id_idx on public.membros (user_id);

-- ---------------------------------------------------------------------------
-- Serviços, horários e bloqueios
-- ---------------------------------------------------------------------------

create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nome text not null check (length(trim(nome)) between 2 and 80),
  duracao_min integer not null check (duracao_min between 5 and 720),
  preco_centavos integer not null check (preco_centavos >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (negocio_id, id)
);

-- dia_semana: 0 = domingo ... 6 = sábado. Dia sem linha = fechado.
create table public.horarios_funcionamento (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  abre time not null,
  fecha time not null,
  pausa_inicio time,
  pausa_fim time,
  unique (negocio_id, dia_semana),
  check (abre < fecha),
  check (
    (pausa_inicio is null and pausa_fim is null)
    or (pausa_inicio is not null and pausa_fim is not null
        and abre <= pausa_inicio and pausa_inicio < pausa_fim and pausa_fim <= fecha)
  )
);

create table public.bloqueios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  motivo text,
  criado_em timestamptz not null default now(),
  check (inicio < fim)
);
create index bloqueios_negocio_inicio_idx on public.bloqueios (negocio_id, inicio);

-- ---------------------------------------------------------------------------
-- Clientes e agendamentos
-- ---------------------------------------------------------------------------

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nome text not null check (length(trim(nome)) between 1 and 80),
  telefone text not null check (telefone ~ '^\+[1-9][0-9]{7,14}$'), -- E.164
  criado_em timestamptz not null default now(),
  unique (negocio_id, telefone),
  unique (negocio_id, id)
);

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  cliente_id uuid not null,
  servico_id uuid not null,
  inicio timestamptz not null,
  fim timestamptz not null,
  status text not null default 'confirmado'
    check (status in ('confirmado', 'cancelado', 'concluido', 'faltou')),
  origem text not null check (origem in ('ia', 'dono', 'link')),
  criado_em timestamptz not null default now(),
  check (inicio < fim),
  -- cliente e serviço precisam ser do mesmo negócio do agendamento
  foreign key (negocio_id, cliente_id) references public.clientes (negocio_id, id) on delete cascade,
  foreign key (negocio_id, servico_id) references public.servicos (negocio_id, id) on delete restrict,
  -- última defesa contra dois horários confirmados sobrepostos no mesmo negócio.
  -- '[)' = fim aberto: um horário que termina às 10:00 não bate com outro que começa às 10:00.
  constraint agendamentos_sem_sobreposicao exclude using gist (
    negocio_id with =,
    tstzrange(inicio, fim, '[)') with &&
  ) where (status = 'confirmado')
);
create index agendamentos_cliente_idx on public.agendamentos (negocio_id, cliente_id);
create index agendamentos_servico_idx on public.agendamentos (negocio_id, servico_id);
create index agendamentos_negocio_inicio_idx on public.agendamentos (negocio_id, inicio);

-- ---------------------------------------------------------------------------
-- Conversas e mensagens
-- ---------------------------------------------------------------------------

create table public.conversas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  cliente_id uuid not null,
  canal text not null default 'whatsapp' check (canal in ('whatsapp', 'teste')),
  modo text not null default 'ia' check (modo in ('ia', 'humano')),
  ultima_mensagem_em timestamptz not null default now(),
  criado_em timestamptz not null default now(),
  foreign key (negocio_id, cliente_id) references public.clientes (negocio_id, id) on delete cascade,
  unique (negocio_id, cliente_id, canal),
  unique (negocio_id, id)
);
create index conversas_recentes_idx on public.conversas (negocio_id, ultima_mensagem_em desc);

create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  conversa_id uuid not null,
  autor text not null check (autor in ('cliente', 'ia', 'dono')),
  texto text not null,
  wa_message_id text unique, -- deduplicação do webhook do WhatsApp
  criado_em timestamptz not null default now(),
  foreign key (negocio_id, conversa_id) references public.conversas (negocio_id, id) on delete cascade
);
create index mensagens_conversa_idx on public.mensagens (conversa_id, criado_em);

-- ---------------------------------------------------------------------------
-- Lista de espera da própria Marcaí (não pertence a um negócio).
-- Só o servidor (service role) lê e grava.
-- ---------------------------------------------------------------------------

create table public.lista_espera (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  negocio text not null,
  tipo text,
  cidade text,
  whatsapp text not null,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- O usuário logado é membro deste negócio?
-- security definer para ler membros sem cair na própria política (evita recursão).
create function public.eh_membro(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.membros m
    where m.negocio_id = p_negocio_id
      and m.user_id = (select auth.uid())
  );
$$;
revoke execute on function public.eh_membro(uuid) from public, anon;
grant execute on function public.eh_membro(uuid) to authenticated;

alter table public.negocios enable row level security;
alter table public.membros enable row level security;
alter table public.servicos enable row level security;
alter table public.horarios_funcionamento enable row level security;
alter table public.bloqueios enable row level security;
alter table public.clientes enable row level security;
alter table public.agendamentos enable row level security;
alter table public.conversas enable row level security;
alter table public.mensagens enable row level security;
alter table public.lista_espera enable row level security;

-- negocios: o membro vê e edita o próprio negócio. Criar e apagar só pelo servidor.
create policy "membro ve o negocio" on public.negocios
  for select to authenticated using (public.eh_membro(id));
create policy "membro edita o negocio" on public.negocios
  for update to authenticated using (public.eh_membro(id)) with check (public.eh_membro(id));

-- membros: cada um vê a equipe do próprio negócio. Convites ficam com o servidor.
create policy "membro ve a equipe" on public.membros
  for select to authenticated using (public.eh_membro(negocio_id));

-- Demais tabelas: o membro faz tudo dentro do próprio negócio.
create policy "membro gerencia servicos" on public.servicos
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia horarios" on public.horarios_funcionamento
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia bloqueios" on public.bloqueios
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia clientes" on public.clientes
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia agendamentos" on public.agendamentos
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia conversas" on public.conversas
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));
create policy "membro gerencia mensagens" on public.mensagens
  for all to authenticated using (public.eh_membro(negocio_id)) with check (public.eh_membro(negocio_id));

-- lista_espera: RLS ligado e nenhuma política = só a service role acessa.
