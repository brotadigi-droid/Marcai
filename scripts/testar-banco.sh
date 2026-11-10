#!/usr/bin/env bash
# Aplica migrations + seed num Postgres DESCARTÁVEL e roda supabase/verificacoes/regras.sql.
# Uso: URL_BANCO_TESTE=postgres://usuario@localhost:5432/postgres npm run test:db
# Atenção: apaga e recria o banco "marcai_teste" nesse servidor. Nunca aponte para o Supabase de produção.
set -euo pipefail
: "${URL_BANCO_TESTE:?Defina URL_BANCO_TESTE com um Postgres local descartável}"
PSQL=(psql -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" "$URL_BANCO_TESTE" -c "drop database if exists marcai_teste" -c "create database marcai_teste"
TESTE="${URL_BANCO_TESTE%/*}/marcai_teste"
"${PSQL[@]}" "$TESTE" -f supabase/verificacoes/supabase-simulado.sql
for f in supabase/migrations/*.sql; do "${PSQL[@]}" "$TESTE" -f "$f"; done
"${PSQL[@]}" "$TESTE" -f supabase/seed.sql
"${PSQL[@]}" "$TESTE" -f supabase/verificacoes/regras.sql
echo "Banco OK"
