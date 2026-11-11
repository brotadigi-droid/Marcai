# Marcaí

Atendente virtual com agenda online para pequenos negócios de serviço: salões de beleza, manicures, clínicas de estética, barbearias, estúdios de sobrancelha e cílios. A atendente (nome padrão "Lia") conversa com os clientes pelo WhatsApp e pelo Instagram Direct, oferece horários livres e marca sozinha, enquanto o dono atende.

Slogan: "Seu cliente pede. A Marcaí marca."

## Quem usa

- **Dono do negócio**: usa o painel (celular primeiro, computador também) para ver a agenda, acompanhar conversas, assumir uma conversa e configurar serviços, horários e cores.
- **Cliente final**: conversa pelo WhatsApp do negócio ou marca pela página pública `marcai.app/<slug>`. Nunca precisa criar conta.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**, hospedado na Vercel.
- **Supabase**: Postgres, autenticação do dono (e-mail com link mágico) e Row Level Security.
- **Claude API** (SDK `@anthropic-ai/sdk`) para a atendente, com tool use. Modelo padrão `claude-haiku-5-5`; usar `claude-sonnet-5-5` só se a qualidade pedir.
- **WhatsApp Business Platform (Cloud API)** da Meta: webhook para receber mensagens, Graph API para enviar.
- **Instagram Direct** pela API de mensagens do Instagram da Meta, no mesmo webhook (etapa 5b do plano).
- Testes com **Vitest**. Lint com ESLint e formatação com Prettier.

## Estrutura de pastas

```
public/lancamento.html                                  -> site de lançamento, servido em / (rewrite no next.config.ts)
app/
  api/lista-espera/route.ts                             -> inscrição da lista de espera (função entrar_lista_espera)
  (painel)/hoje, agenda, conversas, clientes, ajustes   -> painel do dono (autenticado)
  [slug]/                                               -> página pública de agendamento
  api/whatsapp/webhook/route.ts                         -> recebe e verifica mensagens da Meta
  api/cron/lembretes/route.ts                           -> envia lembretes
lib/
  agenda/disponibilidade.ts   -> cálculo de horários livres (função pura, com testes)
  agenda/agendar.ts           -> criar, remarcar e cancelar (sempre em transação)
  agente/lia.ts               -> laço do agente com a Claude API
  agente/ferramentas.ts       -> definições e execução das tools
  agente/instrucoes.ts        -> monta as instruções da Lia a partir do negócio
  whatsapp/cliente.ts         -> envio de mensagens e modelos
supabase/migrations/          -> SQL versionado
docs/                         -> PLANO-MVP.md, marca.md, agente.md
```

## Modelo de dados (resumo)

`negocios` (nome, slug, tipo, endereço, fuso `America/Sao_Paulo`, nome_atendente, tom_voz, avisos, cor_principal, cor_destaque, cantos, fundo, whatsapp_phone_number_id) ·
`membros` (negocio_id, user_id, papel) · `servicos` (nome, duracao_min, preco_centavos, ativo) ·
`horarios_funcionamento` (dia_semana, abre, fecha, pausa_inicio, pausa_fim) · `bloqueios` (inicio, fim, motivo) ·
`clientes` (nome, telefone E.164) · `agendamentos` (cliente_id, servico_id, inicio, fim, status: confirmado | cancelado | concluido | faltou, origem: ia | dono | link) ·
`conversas` (cliente_id, canal, modo: ia | humano, ultima_mensagem_em) · `mensagens` (autor: cliente | ia | dono, texto, wa_message_id único) · `lista_espera`.

Regras:

- Toda tabela tem `negocio_id`, e o RLS só deixa um membro ver as linhas do próprio negócio.
- `agendamentos` tem uma exclusion constraint (`btree_gist`) que impede dois horários confirmados sobrepostos no mesmo negócio.
- Datas e horas ficam em `timestamptz`. A exibição usa o fuso do negócio.
- Valores ficam em centavos (inteiro).

## A atendente (Lia)

Detalhes em `docs/agente.md`. O essencial:

- Escreve como gente no WhatsApp: 1 a 3 frases, sem markdown, no máximo um emoji. Usa o nome do cliente.
- **Nunca inventa** preço, horário ou serviço. Só usa o que vem das tools e dos dados do negócio.
- Sempre chama `ver_horarios` antes de oferecer horários e oferece 2 ou 3 opções.
- Confirma serviço, dia, hora e preço antes de chamar `agendar`.
- Se perguntarem, diz com honestidade que é a atendente virtual do negócio.
- O que não souber vira `chamar_dono` e um alerta no painel.
- Se `conversas.modo = humano`, a Lia não responde.

## Regras de código

- Toda regra de agenda passa por `lib/agenda`. A IA nunca escreve no banco direto: ela só chama tools, e as tools validam tudo de novo no servidor.
- O webhook do WhatsApp responde 200 rápido, deduplica por `wa_message_id` e processa a mensagem em seguida.
- Segredos só em variáveis de ambiente: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`. Nunca no código nem no cliente.
- Valide a assinatura `X-Hub-Signature-256` em todo POST do webhook.
- Textos da interface em português do Brasil, com verbos claros ("Marcar às 18:00", depois "Marcado").
- Escreva testes para `disponibilidade.ts` e para as tools antes de ligar a IA.

## Marca e design

Detalhes em `docs/marca.md`. Resumo:

- Direção corporativa e moderna, unissex. Cores: marinho `#0F2340` (estrutura, menu, mensagens da atendente), ciano `#14B8C4` (ação, botão principal), ciano-texto `#0B7F8A` (links sobre claro), ciano-gelo `#DFF6F7` (o que a atendente marcou), âmbar `#FFB547` (selo "Marcado", um por tela), fundo `#F4F7F9`, superfície `#FFFFFF`.
- Gradiente Maré (marinho com luzes ciano e âmbar) só em áreas grandes e escuras.
- Uma fonte só: **Geist** (interface, site e redes).
- O site de lançamento já usa esta marca. O painel ainda usa a paleta antiga (amarelo e verde-petróleo, Onest) e deve migrar para esta.
- Cada negócio pode trocar a cor principal, a cor de destaque, o fundo (claro ou escuro) e os cantos na aba Aparência. A interface calcula os tons suaves e a cor do texto para manter o contraste.
- Celular primeiro. Alvos de toque com pelo menos 44 px.

## Comandos

- `npm run dev` · `npm test` · `npm run lint`
- `npm run test:db` testa migrations, seed e regras do banco num Postgres local descartável (`URL_BANCO_TESTE`)
- `npx supabase db push` para aplicar migrations

## Como trabalhar neste projeto

- Siga as etapas de `docs/PLANO-MVP.md`, uma por vez. Ao terminar uma etapa, rode os testes e faça commit.
- Antes de mudanças grandes, mostre o plano e espere a aprovação.
- Prefira soluções simples e baratas de manter. É um produto para microempresas com preço acessível.

## Next.js

Este projeto usa o Next.js 16. Leia também @AGENTS.md antes de escrever código do Next.
