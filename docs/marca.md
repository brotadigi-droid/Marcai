# Marca Marcaí: guia rápido para o código

O manual completo está no design system "Marcaí" no Claude. Este arquivo traz o que o código precisa. Direção: **corporativa e moderna, unissex**: marinho, ciano e um toque de âmbar, fonte Geist.

## Cores (tema claro)
| Token | Hex | Uso |
|---|---|---|
| marca-marinho | #0F2340 | Estrutura: menu, faixas escuras, bloco "Atendendo agora", mensagens da atendente |
| marca-ciano | #14B8C4 | Ação: botão principal (um por tela), item ativo do menu, símbolo sobre fundo escuro |
| ciano-texto | #0B7F8A | Links e destaques escritos sobre fundo claro (nunca use #14B8C4 como texto sobre claro) |
| ciano-gelo | #DFF6F7 | Horários marcados pela atendente, quadro "Ficou combinado" |
| marca-ambar | #FFB547 | Selo "Marcado" e um destaque pontual por tela |
| ambar-suave | #FFF1DA | Alertas para o dono ("Precisa de você") |
| texto-sobre-marinho | #FFFFFF | Texto sobre marinho |
| texto-sobre-ciano | #0F2340 | Texto sobre ciano e âmbar |
| fundo | #F4F7F9 | Fundo da página |
| superficie | #FFFFFF | Cartões e painéis |
| cinza-suave | #E9EEF2 | Horários marcados pelo dono, mensagens do cliente |
| linha | #DEE6EC | Bordas e divisórias |
| texto | #0F2340 | Texto principal |
| texto-suave | #55657A | Legendas e datas |
| sucesso | #12805C | Confirmado |
| erro | #C0362C | Erro, cancelado |

## Tema escuro
fundo #0A1628 · superficie #102038 · cinza-suave #18304E · linha #1E3555 · texto #EAF1F6 · texto-suave #9AAEC2 · marca-ciano #2CCAD5 · ciano-texto #5ED8E1 · ciano-gelo #0E3A44 · ambar-suave #3A2E14.

## Gradientes (só em áreas grandes, nunca em texto ou botão)
- Maré (escuro): `radial-gradient(60% 70% at 85% 10%, rgba(20,184,196,.55) 0%, rgba(20,184,196,0) 70%), radial-gradient(45% 55% at 20% 110%, rgba(255,181,71,.30) 0%, rgba(255,181,71,0) 70%), #0F2340`
- Gelo (claro): `linear-gradient(160deg, #FFFFFF 0%, #EEF8F9 55%, #DFF6F7 100%)`

## Tipografia
- Uma família: **Geist** (400, 500, 600, 700), do Google Fonts.
- Escala: display 72/1.0 600 (−4,5%) · título 44/1.05 600 · subtítulo 24/30 600 · corpo-grande 19/28 · corpo 16/24 · legenda 13/18.
- Algarismos tabulares em horários e valores. Nada de títulos em caixa alta.

## Forma, espaço e sombra
- Cantos: 8 (etiquetas), 12 (botões e campos), 16 (cartões), 24 (blocos de destaque).
- Espaçamento em múltiplos de 4. Entre seções do site: 96 a 112 px no computador, 64 a 72 px no celular.
- Sombra única, só para o que flutua: `0 24px 48px -24px rgba(15,35,64,.35)`.
- Alvos de toque com pelo menos 44 px.

## Movimento
- Entradas curtas (deslocamento de 12 a 22 px, 300 a 700 ms), sem esconder conteúdo.
- Mensagens chegam uma a uma, como no WhatsApp; o horário marcado ganha um destaque âmbar breve.
- Respeite `prefers-reduced-motion`: tudo parado e completo.

## Aparência personalizável
Combinações prontas: Marinho e ciano (padrão, #0F2340/#14B8C4), Grafite e âmbar (#23272F/#FFB547), Verde e areia (#1E4D3A/#E9C46A), Vinho e rosé (#5B1A32/#F2A7B8), Petróleo e mostarda (#0F4C5C/#F2B33D), Azul e tangerina (#13203A/#FF7A3D).
O app calcula a cor do texto pela luminância (texto escuro se luminância > 0,4) e os tons suaves misturando a cor com branco (70%) ou com a superfície escura.

## Logo
Um balão de conversa que também é uma folha de calendário, com um visto dentro. Caminho SVG (viewBox 0 0 64 64):
- Balão: `M14 8h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H28l-13 10V50a10 10 0 0 1-11-10V18A10 10 0 0 1 14 8z`
- Argolas: `M22 3v10M42 3v10` (traço de 5, pontas redondas)
- Visto: `M20 29l8 8 16-16` (traço de 5,5, pontas redondas)
Sobre fundo escuro: balão ciano #14B8C4 e visto marinho. Sobre fundo claro: balão marinho #0F2340 e visto ciano. Palavra "marcaí" em Geist 600, −4,5%.

## Voz
Frases curtas, verbo no início, sem jargão. Botões dizem o que acontece: "Marcar às 18:00", e depois a confirmação "Marcado". Erros dizem o que houve e o que fazer.
