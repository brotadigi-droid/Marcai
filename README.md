# Marcaí

Seu cliente pede. A Marcaí marca.

Atendente virtual com agenda online para pequenos negócios de serviço. Veja `CLAUDE.md` e a pasta `docs/`.

## Comandos

- `npm run dev`: abre o projeto em http://localhost:3000
- `npm test`: roda os testes
- `npm run lint`: confere o código
- `npm run format`: arruma a formatação
- `npm run test:db`: testa as regras do banco num Postgres local descartável (veja `scripts/testar-banco.sh`)

## Banco de dados (Supabase)

No seu computador, uma vez:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJETO
```

Para aplicar as migrations e os dados de exemplo:

```bash
npx supabase db push --include-seed
```
