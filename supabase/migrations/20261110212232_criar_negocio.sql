-- "Criar meu negócio": primeiro acesso do dono.
-- Cria o negócio, liga o usuário logado como dono e preenche horários e serviços padrão do tipo.
-- security definer porque negocios e membros não aceitam insert direto pelo painel.
-- Cada usuário pode criar um negócio por vez (evita abuso no MVP).

create function public.criar_negocio(p_nome text, p_slug text, p_tipo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
  v_tom text;
begin
  if v_user is null then
    raise exception 'Faça login para criar um negócio.' using errcode = '42501';
  end if;
  if exists (select 1 from public.membros where user_id = v_user) then
    raise exception 'Você já tem um negócio cadastrado.' using errcode = 'P0001';
  end if;

  v_tom := case p_tipo
    when 'estetica' then 'calmo, cuidadoso e profissional'
    when 'barbearia' then 'descontraído e direto, pode usar "fala" e "fechou", sem exagerar nas gírias'
    else 'acolhedor e próximo, como uma recepcionista querida pelos clientes'
  end;

  insert into public.negocios (nome, slug, tipo, tom_voz)
  values (trim(p_nome), lower(trim(p_slug)), p_tipo, v_tom)
  returning id into v_id;

  insert into public.membros (negocio_id, user_id, papel) values (v_id, v_user, 'dono');

  -- Terça a sábado, 09:00 às 19:00, almoço 12:00 às 13:00.
  insert into public.horarios_funcionamento (negocio_id, dia_semana, abre, fecha, pausa_inicio, pausa_fim)
  select v_id, d, '09:00', '19:00', '12:00', '13:00' from generate_series(2, 6) as d;

  insert into public.servicos (negocio_id, nome, duracao_min, preco_centavos)
  select v_id, s.nome, s.duracao, s.preco
  from (values
    ('salao', 'Corte feminino', 60, 8000), ('salao', 'Escova', 45, 5000), ('salao', 'Manicure', 40, 3500),
    ('manicure', 'Manicure', 40, 3500), ('manicure', 'Pedicure', 40, 4000), ('manicure', 'Pé e mão', 80, 6000),
    ('estetica', 'Limpeza de pele', 90, 15000), ('estetica', 'Design de sobrancelha', 30, 4500),
    ('estetica', 'Drenagem linfática', 60, 12000),
    ('barbearia', 'Corte', 40, 4500), ('barbearia', 'Barba', 30, 3500), ('barbearia', 'Corte e barba', 60, 7000),
    ('sobrancelha', 'Design de sobrancelha', 30, 4500), ('sobrancelha', 'Henna', 40, 5500),
    ('sobrancelha', 'Extensão de cílios', 120, 18000),
    ('outro', 'Atendimento', 60, 10000)
  ) as s (tipo, nome, duracao, preco)
  where s.tipo = p_tipo;

  return v_id;
end;
$$;

revoke execute on function public.criar_negocio(text, text, text) from public, anon;
grant execute on function public.criar_negocio(text, text, text) to authenticated;
