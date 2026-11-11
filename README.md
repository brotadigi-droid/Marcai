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

## Configuração

Copie `.env.example` para `.env.local` e preencha com o endereço e a chave pública (publishable) do projeto no Supabase.

### Login por link mágico (Supabase)

Em **Authentication → URL Configuration**:

- **Site URL**: o endereço do site (ex.: `https://marcai.vercel.app`)
- **Redirect URLs**: `http://localhost:3000/**` e `https://SEU-SITE/**`

Para o link funcionar mesmo abrindo o e-mail em outro aparelho, em **Authentication → Emails → Magic Link**
troque o link do modelo por:

```
{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email
```

### Publicar na Vercel

Importe o repositório do GitHub na Vercel e adicione as variáveis
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
