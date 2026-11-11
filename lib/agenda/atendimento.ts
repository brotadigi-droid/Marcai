/**
 * Quem aparece no bloco "Atendendo agora" da tela Hoje.
 * Regra: o primeiro agendamento confirmado do dia que já começou ou começa em até 15 minutos.
 * Agendamentos atrasados continuam ali até o dono finalizar ou marcar "Faltou".
 */

export const JANELA_CHEGANDO_MIN = 15;

export type ItemAgenda = { id: string; inicio: Date; fim: Date; status: string };

export type Atendimento<T extends ItemAgenda> =
  | { tipo: "atendendo"; item: T }
  | { tipo: "chegando"; item: T }
  | { tipo: "livre"; proximo: T | null };

export function atendimentoAtual<T extends ItemAgenda>(itens: T[], agora: Date): Atendimento<T> {
  const confirmados = itens
    .filter((i) => i.status === "confirmado")
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const primeiro = confirmados[0];
  if (!primeiro) return { tipo: "livre", proximo: null };
  if (primeiro.inicio <= agora) return { tipo: "atendendo", item: primeiro };
  if (primeiro.inicio.getTime() - agora.getTime() <= JANELA_CHEGANDO_MIN * 60000) {
    return { tipo: "chegando", item: primeiro };
  }
  return { tipo: "livre", proximo: primeiro };
}
