import { diaDaSemana, lerData, somarDias } from "./fuso";

export const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "Hoje", "Amanhã", "Ontem" ou "Quinta, 13 nov". */
export function rotuloDia(data: string, hoje: string): string {
  if (data === hoje) return "Hoje";
  if (data === somarDias(hoje, 1)) return "Amanhã";
  if (data === somarDias(hoje, -1)) return "Ontem";
  const { dia, mes } = lerData(data);
  const nome = DIAS_SEMANA[diaDaSemana(data)];
  return `${nome[0].toUpperCase()}${nome.slice(1)}, ${dia} ${MESES[mes - 1]}`;
}

/** "13 nov" */
export function diaEMes(data: string): string {
  const { dia, mes } = lerData(data);
  return `${dia} ${MESES[mes - 1]}`;
}
