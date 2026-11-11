-- Testes das regras do banco. Rodar num banco DESCARTÁVEL já com a migration e o seed:
--   psql "$URL_BANCO_TESTE" -v ON_ERROR_STOP=1 -f supabase/verificacoes/regras.sql
-- Tudo roda dentro de uma transação que é desfeita no fim.
-- Qualquer falha interrompe com "FALHOU: ...".

begin;

-- Um horário confirmado das 10:00 às 11:00 num dia livre, para os testes.
insert into public.clientes (id, negocio_id, nome, telefone) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Teste', '+5521990009999');
insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'a1000000-0000-4000-8000-000000000002', '2030-01-08 10:00-03', '2030-01-08 11:00-03', 'dono');

-- 1. Sobreposição confirmada é recusada
do $$ begin
  insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem) values
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
     'a1000000-0000-4000-8000-000000000002', '2030-01-08 10:30-03', '2030-01-08 11:15-03', 'ia');
  raise exception 'FALHOU: aceitou horário sobreposto';
exception when exclusion_violation then
  raise notice 'ok 1 - horário sobreposto recusado';
end $$;

-- 2. Encaixe exato (termina 10:00 / começa 11:00) é aceito
do $$ begin
  insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem) values
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
     'a1000000-0000-4000-8000-000000000002', '2030-01-08 09:15-03', '2030-01-08 10:00-03', 'ia'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
     'a1000000-0000-4000-8000-000000000002', '2030-01-08 11:00-03', '2030-01-08 11:45-03', 'ia');
  raise notice 'ok 2 - encaixe exato aceito';
end $$;

-- 3. Horário cancelado não ocupa a agenda
do $$ begin
  insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem, status) values
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
     'a1000000-0000-4000-8000-000000000002', '2030-01-08 10:00-03', '2030-01-08 11:00-03', 'ia', 'cancelado');
  raise notice 'ok 3 - cancelado não bloqueia o horário';
end $$;

-- 4. Outro negócio no mesmo horário é aceito
do $$ begin
  insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem) values
    ('b0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001',
     'b1000000-0000-4000-8000-000000000001', '2030-01-08 10:00-03', '2030-01-08 10:40-03', 'ia');
  raise notice 'ok 4 - negócios diferentes não se bloqueiam';
end $$;

-- 5. Serviço de outro negócio é recusado
do $$ begin
  insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem) values
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
     'b1000000-0000-4000-8000-000000000001', '2030-01-09 10:00-03', '2030-01-09 10:40-03', 'ia');
  raise exception 'FALHOU: aceitou serviço de outro negócio';
exception when foreign_key_violation then
  raise notice 'ok 5 - serviço de outro negócio recusado';
end $$;

-- 6. Telefone fora do E.164 é recusado
do $$ begin
  insert into public.clientes (negocio_id, nome, telefone) values
    ('a0000000-0000-4000-8000-000000000001', 'Errado', '(21) 99999-0000');
  raise exception 'FALHOU: aceitou telefone fora do E.164';
exception when check_violation then
  raise notice 'ok 6 - telefone fora do E.164 recusado';
end $$;

-- 7. Mensagem do WhatsApp repetida é recusada
do $$
declare v_conversa uuid;
begin
  insert into public.conversas (negocio_id, cliente_id) values
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001')
  returning id into v_conversa;
  insert into public.mensagens (negocio_id, conversa_id, autor, texto, wa_message_id) values
    ('a0000000-0000-4000-8000-000000000001', v_conversa, 'cliente', 'oi', 'wamid.TESTE1');
  begin
    insert into public.mensagens (negocio_id, conversa_id, autor, texto, wa_message_id) values
      ('a0000000-0000-4000-8000-000000000001', v_conversa, 'cliente', 'oi', 'wamid.TESTE1');
    raise exception 'FALHOU: aceitou wa_message_id repetido';
  exception when unique_violation then
    raise notice 'ok 7 - mensagem repetida recusada';
  end;
end $$;

-- 8 a 10. RLS: dono da barbearia não enxerga o salão; visitante anônimo não vê nada
insert into auth.users (id, email) values ('d0000000-0000-4000-8000-000000000001', 'ze@exemplo.com');
insert into public.membros (negocio_id, user_id) values
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001');

set local role authenticated;
set local request.jwt.claim.sub = 'd0000000-0000-4000-8000-000000000001';

do $$ begin
  if (select count(*) from public.negocios) <> 1
     or (select slug from public.negocios) <> 'barbearia-do-ze' then
    raise exception 'FALHOU: dono vê negócio que não é dele';
  end if;
  if exists (select 1 from public.agendamentos where negocio_id <> 'b0000000-0000-4000-8000-000000000001') then
    raise exception 'FALHOU: dono vê agendamentos de outro negócio';
  end if;
  if (select count(*) from public.servicos) <> 5 then
    raise exception 'FALHOU: dono não vê os próprios serviços';
  end if;
  raise notice 'ok 8 - dono só vê o próprio negócio';
end $$;

do $$ begin
  insert into public.servicos (negocio_id, nome, duracao_min, preco_centavos) values
    ('a0000000-0000-4000-8000-000000000001', 'Invasão', 30, 100);
  raise exception 'FALHOU: dono gravou serviço em outro negócio';
exception when insufficient_privilege then
  raise notice 'ok 9 - dono não grava em outro negócio';
end $$;

reset role;
set local role anon;
do $$ begin
  if exists (select 1 from public.negocios) or exists (select 1 from public.agendamentos)
     or exists (select 1 from public.lista_espera) then
    raise exception 'FALHOU: visitante anônimo vê dados';
  end if;
  raise notice 'ok 10 - visitante anônimo não vê nada';
end $$;

-- 11 e 12. Primeiro acesso: criar_negocio cria o negócio com padrões e só uma vez
reset role;
insert into auth.users (id, email) values ('d0000000-0000-4000-8000-000000000002', 'nova@exemplo.com');
set local role authenticated;
set local request.jwt.claim.sub = 'd0000000-0000-4000-8000-000000000002';

do $$
declare v_id uuid;
begin
  v_id := public.criar_negocio('Unhas da Bia', 'unhas-da-bia', 'manicure');
  if (select count(*) from public.servicos where negocio_id = v_id) <> 3
     or (select count(*) from public.horarios_funcionamento where negocio_id = v_id) <> 5
     or (select count(*) from public.negocios) <> 1 then
    raise exception 'FALHOU: criar_negocio não montou o negócio com os padrões';
  end if;
  raise notice 'ok 11 - criar_negocio cria negócio, serviços e horários';
end $$;

do $$ begin
  perform public.criar_negocio('Outro', 'outro-negocio', 'outro');
  raise exception 'FALHOU: criou um segundo negócio';
exception when raise_exception then
  if sqlerrm like 'FALHOU%' then raise; end if;
  raise notice 'ok 12 - só um negócio por usuário';
end $$;

reset role;
set local role anon;
do $$ begin
  perform public.criar_negocio('Anônimo', 'anonimo', 'outro');
  raise exception 'FALHOU: anônimo criou negócio';
exception when insufficient_privilege then
  raise notice 'ok 13 - anônimo não cria negócio';
end $$;

rollback;
