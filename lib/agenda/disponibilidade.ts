/**
 * Cálculo dos horários livres de um dia. Função pura: não lê banco nem relógio,
 * recebe tudo por parâmetro (inclusive o "agora"), o que deixa fácil de testar.
 */

import { dataNoFuso, diaDaSemana, instanteLocal, lerData, paraHora, paraMinutos } from "./fuso";

export type HorarioFuncionamento = {
  /** 0 = domingo ... 6 = sábado */
  diaSemana: number;
  /** "HH:MM" */
  abre: string;
  fecha: string;
  pausaInicio?: string | null;
  pausaFim?: string | null;
};

/** Um período ocupado: agendamento confirmado ou bloqueio. Fim aberto. */
export type Intervalo = { inicio: Date; fim: Date };

export type EntradaDisponibilidade = {
  /** Dia pedido, AAAA-MM-DD, no fuso do negócio. */
  data: string;
  /** Fuso do negócio, ex.: "America/Sao_Paulo". */
  fuso: string;
  horarios: HorarioFuncionamento[];
  bloqueios: Intervalo[];
  /** Só os agendamentos que ocupam a agenda (status confirmado). */
  agendamentos: Intervalo[];
  duracaoMin: number;
  agora: Date;
  /** Antecedência mínima para marcar, em minutos. Padrão: 30. */
  antecedenciaMin?: number;
  /** Intervalo entre os horários oferecidos, em minutos. Padrão: 30. */
  passoMin?: number;
};

export type ResultadoDisponibilidade =
  { fechado: true; horarios: [] } | { fechado: false; horarios: string[] };

export const ANTECEDENCIA_PADRAO_MIN = 30;
export const PASSO_PADRAO_MIN = 30;

const sobrepoe = (a: Intervalo, b: Intervalo) => a.inicio < b.fim && b.inicio < a.fim;

/**
 * Devolve os horários de início livres ("HH:MM") para um serviço numa data.
 * `fechado: true` quando o negócio não abre nesse dia da semana.
 */
export function horariosLivres(e: EntradaDisponibilidade): ResultadoDisponibilidade {
  lerData(e.data); // valida
  if (!Number.isInteger(e.duracaoMin) || e.duracaoMin <= 0) {
    throw new Error(`Duração inválida: ${e.duracaoMin}.`);
  }
  const passo = e.passoMin ?? PASSO_PADRAO_MIN;
  const antecedencia = e.antecedenciaMin ?? ANTECEDENCIA_PADRAO_MIN;

  const expediente = e.horarios.find((h) => h.diaSemana === diaDaSemana(e.data));
  if (!expediente) return { fechado: true, horarios: [] };

  // Dia que já passou: aberto, mas sem horários.
  if (e.data < dataNoFuso(e.agora, e.fuso)) return { fechado: false, horarios: [] };

  const abre = paraMinutos(expediente.abre);
  const fecha = paraMinutos(expediente.fecha);
  const pausa =
    expediente.pausaInicio && expediente.pausaFim
      ? { inicio: paraMinutos(expediente.pausaInicio), fim: paraMinutos(expediente.pausaFim) }
      : null;

  const ocupados = [...e.bloqueios, ...e.agendamentos];
  const limite = new Date(e.agora.getTime() + antecedencia * 60000);
  const livres: string[] = [];

  for (let ini = abre; ini + e.duracaoMin <= fecha; ini += passo) {
    const fim = ini + e.duracaoMin;
    if (pausa && ini < pausa.fim && pausa.inicio < fim) continue;

    const slot: Intervalo = {
      inicio: instanteLocal(e.data, ini, e.fuso),
      fim: instanteLocal(e.data, fim, e.fuso),
    };
    if (slot.inicio < limite) continue;
    if (ocupados.some((o) => sobrepoe(slot, o))) continue;

    livres.push(paraHora(ini));
  }

  return { fechado: false, horarios: livres };
}
