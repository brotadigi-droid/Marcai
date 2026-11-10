-- Dados de exemplo: um salão e uma barbearia (os mesmos da página de lançamento).
-- Os agendamentos caem no próximo dia útil (terça a sábado) a partir de amanhã,
-- no fuso do negócio, para a agenda nunca nascer vazia ou no passado.
-- O dono é ligado ao negócio na Etapa 2, quando fizer o primeiro login.

insert into public.negocios
  (id, nome, slug, tipo, endereco, nome_atendente, tom_voz, avisos, cor_principal, cor_destaque)
values
  ('a0000000-0000-4000-8000-000000000001', 'Studio Ana Luz', 'studio-ana-luz', 'salao',
   'Rua Voluntários da Pátria, 120, Botafogo, Rio de Janeiro', 'Lia',
   'acolhedor e próximo, como uma recepcionista querida pelas clientes',
   'Tolerância de 15 minutos. Coloração precisa de teste de mecha 48 horas antes, sem custo.',
   '#0F3D3E', '#FFD23F'),
  ('b0000000-0000-4000-8000-000000000001', 'Barbearia do Zé', 'barbearia-do-ze', 'barbearia',
   'Rua Conde de Bonfim, 210, Tijuca, Rio de Janeiro', 'Lia',
   'descontraído e direto, pode usar "fala" e "fechou", sem exagerar nas gírias',
   'Tolerância de 10 minutos. Pagamento em Pix, débito ou crédito.',
   '#1B2F5B', '#FF9F43');

insert into public.servicos (id, negocio_id, nome, duracao_min, preco_centavos) values
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Corte feminino', 60, 8000),
  ('a1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Escova', 45, 5000),
  ('a1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Manicure', 40, 3500),
  ('a1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Pé e mão', 80, 6000),
  ('a1000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Coloração', 120, 18000),
  ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Corte', 40, 4500),
  ('b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Barba', 30, 3500),
  ('b1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'Corte e barba', 60, 7000),
  ('b1000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'Pezinho', 15, 1500),
  ('b1000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'Sobrancelha', 15, 2000);

-- Terça (2) a sábado (6). Salão das 09:00 às 19:00, barbearia até as 20:00. Almoço 12:00 às 13:00.
insert into public.horarios_funcionamento (negocio_id, dia_semana, abre, fecha, pausa_inicio, pausa_fim)
select n.id, d, '09:00', n.fecha, '12:00', '13:00'
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, '19:00'::time),
  ('b0000000-0000-4000-8000-000000000001'::uuid, '20:00'::time)
) as n (id, fecha)
cross join generate_series(2, 6) as d;

insert into public.clientes (id, negocio_id, nome, telefone) values
  ('a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Cláudia', '+5521990000001'),
  ('a2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Bianca', '+5521990000002'),
  ('a2000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Juliana', '+5521990000003'),
  ('b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Rodrigo', '+5521990000011'),
  ('b2000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Caio', '+5521990000012'),
  ('b2000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'Felipe', '+5521990000013'),
  ('b2000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'Marcos', '+5521990000014');

with dia as (
  -- próximo dia de terça a sábado a partir de amanhã, no horário de Brasília
  select min(d)::date as data
  from generate_series(
    (now() at time zone 'America/Sao_Paulo')::date + 1,
    (now() at time zone 'America/Sao_Paulo')::date + 7,
    interval '1 day'
  ) as d
  where extract(dow from d) between 2 and 6
)
insert into public.agendamentos (negocio_id, cliente_id, servico_id, inicio, fim, origem)
select a.negocio_id, a.cliente_id, s.id,
       (dia.data + a.hora) at time zone 'America/Sao_Paulo',
       (dia.data + a.hora + make_interval(mins => s.duracao_min)) at time zone 'America/Sao_Paulo',
       a.origem
from dia
cross join (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'a2000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000005'::uuid, '09:00'::time, 'dono'),
  ('a0000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', '14:00', 'ia'),
  ('a0000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', '16:30', 'link'),
  ('b0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', '10:00', 'dono'),
  ('b0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', '14:30', 'ia'),
  ('b0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', '16:00', 'ia'),
  ('b0000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', '18:00', 'dono')
) as a (negocio_id, cliente_id, servico_id, hora, origem)
join public.servicos s on s.id = a.servico_id;
