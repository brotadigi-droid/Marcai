-- Ajustes apontados pelo verificador do Supabase.

-- 1. eh_membro sai do esquema public (exposto pela API em /rest/v1/rpc) para um esquema privado.
--    As políticas continuam usando a função; ela só deixa de ser chamável pela API.
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

alter function public.eh_membro(uuid) set schema privado;
revoke execute on function privado.eh_membro(uuid) from public, anon;
grant execute on function privado.eh_membro(uuid) to authenticated;

-- 2. Índice que cobre as chaves estrangeiras de mensagens (negocio_id e negocio_id + conversa_id).
drop index if exists public.mensagens_conversa_idx;
create index mensagens_conversa_idx on public.mensagens (negocio_id, conversa_id, criado_em);
