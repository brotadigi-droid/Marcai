-- Lista de espera do site: qualquer visitante pode se inscrever, ninguém de fora pode ler.
-- A tabela continua sem políticas (só a service role lê). A inscrição passa por esta função,
-- que valida os campos e grava uma linha por WhatsApp (repetir o envio atualiza a inscrição).

alter table public.lista_espera add column plano text;

create unique index lista_espera_whatsapp_unico on public.lista_espera (whatsapp);

create function public.entrar_lista_espera(
  p_nome text,
  p_negocio text,
  p_tipo text,
  p_cidade text,
  p_whatsapp text,
  p_plano text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_zap text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
begin
  if length(trim(coalesce(p_nome, ''))) < 2 or length(trim(coalesce(p_negocio, ''))) < 2 then
    raise exception 'Preencha seu nome e o nome do negócio.' using errcode = '22023';
  end if;
  if length(v_zap) < 10 or length(v_zap) > 13 then
    raise exception 'Digite o WhatsApp com DDD.' using errcode = '22023';
  end if;
  if length(p_nome) > 120 or length(p_negocio) > 120 or length(coalesce(p_cidade, '')) > 80
     or length(coalesce(p_tipo, '')) > 40 or length(coalesce(p_plano, '')) > 40 then
    raise exception 'Algum campo ficou longo demais.' using errcode = '22023';
  end if;

  insert into public.lista_espera (nome, negocio, tipo, cidade, whatsapp, plano)
  values (trim(p_nome), trim(p_negocio), nullif(trim(p_tipo), ''), nullif(trim(p_cidade), ''), v_zap, nullif(trim(p_plano), ''))
  on conflict (whatsapp) do update
    set nome = excluded.nome, negocio = excluded.negocio, tipo = excluded.tipo,
        cidade = excluded.cidade, plano = excluded.plano, criado_em = now();
end;
$$;

revoke all on function public.entrar_lista_espera(text, text, text, text, text, text) from public;
grant execute on function public.entrar_lista_espera(text, text, text, text, text, text) to anon, authenticated;
