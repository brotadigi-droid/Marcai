# Marca Marcaí: guia rápido para o código

O manual completo está no design system "Marcaí" no Claude. Este arquivo traz o que o código precisa.

## Cores (tema claro)

| Token                | Hex     | Uso                                                        |
| -------------------- | ------- | ---------------------------------------------------------- |
| marca-amarelo        | #FFD23F | Botão principal (um por tela), item ativo do menu, símbolo |
| marca-amarelo-suave  | #FFF1B8 | Horários marcados pela atendente, quadro "Ficou combinado" |
| marca-petroleo       | #0F3D3E | Menu, bloco "Atendendo agora", mensagens da atendente      |
| texto-sobre-amarelo  | #0F3D3E | Texto sobre amarelo                                        |
| texto-sobre-petroleo | #FFFFFF | Texto sobre petróleo                                       |
| fundo                | #F1F4F2 | Fundo da página                                            |
| superficie           | #FFFFFF | Cartões e painéis                                          |
| cinza-suave          | #E6EEEA | Horários marcados pelo dono, mensagens do cliente          |
| menta-suave          | #DDEFE8 | Confirmações, seções calmas                                |
| pessego-suave        | #FFE3D3 | Avisos leves, destaques quentes                            |
| linha                | #DCE5E1 | Bordas e divisórias                                        |
| texto                | #0F3D3E | Texto principal                                            |
| texto-suave          | #4F5F5C | Legendas e datas                                           |
| sucesso              | #1C6E45 | Confirmado                                                 |
| erro                 | #B3261E | Erro, cancelado                                            |

## Tema escuro

fundo #0B1C1C · superficie #122929 · cinza-suave #1C3637 · linha #234041 · texto #EEF4F2 · texto-suave #9DB2AE · marca-amarelo-suave #3A3112 · menta-suave #173A33 · pessego-suave #3F2A20.

## Gradientes (só em áreas grandes)

- Sol: `linear-gradient(135deg, #FFE27A 0%, #FFD23F 42%, #FFB38A 100%)`
- Noite: `linear-gradient(160deg, #1A5556 0%, #0F3D3E 55%, #082526 100%)`

## Tipografia

- Interface: **Onest** (400, 500, 600, 700, 800), do Google Fonts.
- Escala: display 48/52 800 · título 34/40 800 · subtítulo 22/28 700 · corpo 15/22 400 · legenda 13/18 400.
- Use algarismos tabulares em horários e valores.

## Forma e espaço

- Cantos: 8 (etiquetas), 12 (botões e campos), 16 (cartões), 24 (bloco de destaque e balões).
- Espaçamento em múltiplos de 4.
- Alvos de toque com pelo menos 44 px.

## Aparência personalizável

Combinações prontas: Amarelo e petróleo (padrão), Petróleo e mostarda (#0F4C5C/#F2B33D), Marinho e laranja (#1B2F5B/#FF9F43), Verde e areia (#1E4D3A/#E9C46A), Vinho e rosé (#5B1A32/#F2A7B8), Grafite e ciano (#2B2F36/#5CC8D7).
O app calcula a cor do texto pela luminância (texto escuro se luminância > 0,4) e os tons suaves misturando a cor com branco (72%) ou com a superfície escura.

## Logo

Um balão de conversa que também é uma folha de calendário, com um visto dentro. Caminho SVG (viewBox 0 0 64 64):

- Balão: `M14 8h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H28l-13 10V50a10 10 0 0 1-11-10V18A10 10 0 0 1 14 8z`
- Argolas: `M22 3v10M42 3v10` (traço de 5, pontas redondas)
- Visto: `M20 29l8 8 16-16` (traço de 5,5, pontas redondas)
  Sobre fundo escuro, o balão é amarelo e o visto petróleo. Sobre fundo claro, o balão é petróleo e o visto amarelo.

## Voz

Frases curtas, verbo no início, sem jargão. Botões dizem o que acontece: "Marcar às 18:00", e depois a confirmação "Marcado". Erros dizem o que houve e o que fazer.
