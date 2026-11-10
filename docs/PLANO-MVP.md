# Plano do MVP da Marcaí

O objetivo do MVP é ter **5 a 10 negócios reais** usando a Marcaí por 30 dias: salão, manicure, clínica de estética e barbearia. Cada etapa abaixo traz o pedido pronto para colar no Claude Code. Faça uma etapa por vez, teste e só então siga para a próxima.

## Antes de começar: contas que você vai precisar

| Conta                                   | Para quê                      | Quando  |
| --------------------------------------- | ----------------------------- | ------- |
| GitHub                                  | Guardar o código              | Etapa 0 |
| Supabase                                | Banco de dados e login        | Etapa 1 |
| Vercel                                  | Colocar o site no ar          | Etapa 2 |
| Claude Console (platform.claude.com)    | Chave da API para a atendente | Etapa 4 |
| Meta for Developers + WhatsApp Business | Ligar ao WhatsApp             | Etapa 5 |
| Registro.br                             | Domínio marcai.com.br         | Etapa 7 |

As chaves e senhas dessas contas ficam só no arquivo `.env.local` no seu computador e nas configurações da Vercel. Nunca cole chaves dentro do chat nem no código.

---

## Etapa 0: Criar o projeto

Crie uma pasta `marcai`, copie para dentro dela o `CLAUDE.md` e a pasta `docs/` deste kit, abra o terminal nela e rode `claude`.

> Leia o CLAUDE.md e os arquivos em docs/. Crie um projeto Next.js com App Router, TypeScript, Tailwind, ESLint, Prettier e Vitest nesta pasta, sem apagar CLAUDE.md nem docs/. Configure a fonte Onest e as cores da marca como variáveis do Tailwind, conforme docs/marca.md. Inicie o git e faça o primeiro commit.

**Pronto quando:** `npm run dev` abre uma página com a fonte e as cores da marca.

## Etapa 1: Banco de dados e regras da agenda

> Crie as migrations do Supabase com o modelo de dados do CLAUDE.md, incluindo RLS por negocio_id e a exclusion constraint que impede horários sobrepostos. Depois crie lib/agenda/disponibilidade.ts: uma função pura que recebe horários de funcionamento, pausa, bloqueios, agendamentos existentes, duração do serviço, data e "agora", e devolve os horários livres de 30 em 30 minutos. Escreva testes com Vitest para: dia fechado, almoço, encaixe exato, serviço longo que não cabe, horários que já passaram hoje, bloqueios e fuso America/Sao_Paulo. Crie também um seed com dois negócios de exemplo, um salão e uma barbearia.

**Pronto quando:** todos os testes passam e o seed aparece no Supabase.

## Etapa 2: Painel do dono

> Crie o login do dono com link mágico do Supabase e o painel, seguindo o design de docs/marca.md: menu lateral em petróleo, a tela Hoje com o bloco "Atendendo agora", a lista dos próximos horários (cor diferente para quem marcou: atendente ou dono) e o botão "Finalizar e chamar próximo". Crie também as telas Agenda (semana), Serviços, Horários e Aparência (combinações prontas, cor livre, fundo claro ou escuro, cantos). Tudo precisa funcionar bem no celular.

**Pronto quando:** você entra pelo celular, cadastra serviços e horários e vê a agenda do dia.

## Etapa 3: Página pública de agendamento

> Crie a página pública /[slug]: o cliente escolhe o serviço, o dia e um horário livre (usando lib/agenda), informa nome e WhatsApp e confirma. Use as cores escolhidas pelo negócio na Aparência e mostre "Agendamento por Marcaí" no rodapé. Depois da confirmação, mostre um resumo em forma de comanda. Proteja a página contra envio duplicado e contra horário que acabou de ser ocupado.

**Pronto quando:** um amigo consegue marcar pelo link e o horário aparece no seu painel.

## Etapa 4: A atendente com IA (ainda sem WhatsApp)

> Implemente a Lia seguindo docs/agente.md, com a Claude API e tool use: ver_horarios, agendar, cancelar_agendamento, buscar_agendamentos e chamar_dono. As tools usam lib/agenda e validam tudo no servidor. Monte as instruções a partir dos dados do negócio (serviços, preços, horários, avisos, tom de voz). Crie no painel uma tela "Testar atendente", com um chat que simula o cliente, para eu testar antes de ligar ao WhatsApp. Guarde as conversas nas tabelas conversas e mensagens. Escreva testes das tools.

**Pronto quando:** você conversa com a Lia no painel, ela marca, remarca e cancela certo, e nunca inventa preço.

## Etapa 5: Ligar ao WhatsApp

> Integre a WhatsApp Cloud API: rota de webhook com verificação (hub.challenge), validação da assinatura X-Hub-Signature-256, deduplicação por wa_message_id, resposta 200 imediata e processamento da mensagem pela Lia. Envie as respostas pela Graph API. Na tela Conversas do painel, mostre as conversas ao vivo e um botão "Assumir conversa", que muda o modo para humano e deixa o dono responder pelo painel. Comece com o número de teste da Meta.

**Pronto quando:** você manda "tem horário amanhã?" do seu WhatsApp e a Lia responde e marca.

## Etapa 6: Lembretes

> Crie um cron (Vercel Cron) que, a cada 15 minutos, envia o lembrete dos agendamentos das próximas 2 horas usando um modelo de mensagem aprovado na Meta, com os botões "Confirmo" e "Preciso remarcar". Trate as respostas: "Preciso remarcar" passa a conversa para a Lia.

**Pronto quando:** você recebe o lembrete e consegue remarcar pela conversa.

## Etapa 7: Lista de espera e domínio

> Coloque a página de lançamento (docs/landing.html, se existir) no domínio, com o formulário da lista de espera salvando na tabela lista_espera. Crie no painel de administração uma lista simples dos interessados.

## Etapa 8: Teste com negócios reais

Coloque de 5 a 10 negócios para usar por 30 dias e acompanhe:

- quantos horários a Lia marcou sozinha;
- quantas conversas precisaram do dono;
- quanto custou cada negócio por mês (API da Claude + WhatsApp + hospedagem).

Com esses números, defina o preço. A cobrança (Pix ou cartão recorrente) entra só depois disso.

---

## Cuidados que valem para todas as etapas

- Peça ao Claude Code para **mostrar o plano antes** de mudanças grandes.
- Faça commit ao fim de cada etapa: "faça commit com uma mensagem descritiva".
- Dados de clientes são pessoais (LGPD): guarde só o necessário (nome, telefone e agendamentos) e tenha uma política de privacidade antes de abrir para o público.
