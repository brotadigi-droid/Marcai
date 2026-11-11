/**
 * Criar, cancelar e mudar o status de agendamentos.
 * Usado pelo painel (dono), pela página pública (link) e, na Etapa 4, pela Lia (ia).
 *
 * Sempre valida de novo no servidor: o serviço existe e está ativo, o horário está
 * livre agora. Se duas pessoas pegarem o mesmo horário ao mesmo tempo, a exclusion
 * constraint do banco recusa a segunda, e devolvemos "ocupado" com os horários livres.
 */

import { horariosLivres, type HorarioFuncionamento, type Intervalo } from "./disponibilidade";
import { instanteLocal, lerData, limitesDoDia, paraMinutos } from "./fuso";

export type Origem = "ia" | "dono" | "link";
export type Status = "confirmado" | "cancelado" | "concluido" | "faltou";

export type Servico = {
  id: string;
  nome: string;
  duracaoMin: number;
  precoCentavos: number;
  ativo: boolean;
};

export type AgendamentoCriado = {
  id: string;
  clienteId: string;
  servico: Servico;
  inicio: Date;
  fim: Date;
};

/** O que o agendar precisa do banco. A implementação real fica em lib/agenda/repositorio.ts. */
export interface RepositorioAgenda {
  fuso: string;
  buscarServico(servicoId: string): Promise<Servico | null>;
  buscarHorarios(): Promise<HorarioFuncionamento[]>;
  /** Bloqueios e agendamentos confirmados que tocam o intervalo. */
  buscarOcupados(
    inicio: Date,
    fim: Date,
  ): Promise<{ bloqueios: Intervalo[]; agendamentos: Intervalo[] }>;
  /** Cliente pelo telefone (E.164); cria se não existir. Não troca o nome de quem já existe. */
  buscarOuCriarCliente(nome: string, telefone: string): Promise<{ id: string; nome: string }>;
  /** Lança ErroHorarioOcupado se a constraint do banco recusar. */
  inserirAgendamento(a: {
    clienteId: string;
    servicoId: string;
    inicio: Date;
    fim: Date;
    origem: Origem;
  }): Promise<{ id: string }>;
  mudarStatus(agendamentoId: string, status: Status): Promise<boolean>;
}

export class ErroHorarioOcupado extends Error {
  constructor() {
    super("Horário ocupado");
  }
}

export type ResultadoMarcacao =
  { ok: true; agendamento: AgendamentoCriado } | { ok: false; erro: string; livres?: string[] };

export type PedidoMarcacao = {
  servicoId: string;
  /** AAAA-MM-DD no fuso do negócio */
  data: string;
  /** HH:MM */
  hora: string;
  nomeCliente: string;
  /** Telefone já em E.164 */
  telefone: string;
  origem: Origem;
  agora: Date;
  /** O dono pode marcar em cima da hora; a Lia e o link respeitam a antecedência. */
  antecedenciaMin?: number;
};

/** Horários livres de um serviço numa data, lendo o banco. */
export async function verHorarios(
  repo: RepositorioAgenda,
  servico: Pick<Servico, "duracaoMin">,
  data: string,
  agora: Date,
  antecedenciaMin?: number,
) {
  const { inicio, fim } = limitesDoDia(data, repo.fuso);
  const [horarios, ocupados] = await Promise.all([
    repo.buscarHorarios(),
    repo.buscarOcupados(inicio, fim),
  ]);
  return horariosLivres({
    data,
    fuso: repo.fuso,
    horarios,
    bloqueios: ocupados.bloqueios,
    agendamentos: ocupados.agendamentos,
    duracaoMin: servico.duracaoMin,
    agora,
    antecedenciaMin,
  });
}

export async function marcarHorario(
  repo: RepositorioAgenda,
  p: PedidoMarcacao,
): Promise<ResultadoMarcacao> {
  const nome = p.nomeCliente.trim();
  if (nome.length < 2) return { ok: false, erro: "Informe o nome do cliente." };
  try {
    lerData(p.data);
    paraMinutos(p.hora);
  } catch {
    return { ok: false, erro: "Data ou hora inválida." };
  }

  const servico = await repo.buscarServico(p.servicoId);
  if (!servico || !servico.ativo) return { ok: false, erro: "Esse serviço não está disponível." };

  const disp = await verHorarios(repo, servico, p.data, p.agora, p.antecedenciaMin);
  if (disp.fechado) return { ok: false, erro: "O negócio não abre nesse dia.", livres: [] };

  const hora = p.hora.slice(0, 5);
  if (!disp.horarios.includes(hora)) {
    return { ok: false, erro: `O horário ${hora} não está livre.`, livres: disp.horarios };
  }

  const minutos = paraMinutos(hora);
  const inicio = instanteLocal(p.data, minutos, repo.fuso);
  const fim = instanteLocal(p.data, minutos + servico.duracaoMin, repo.fuso);
  const cliente = await repo.buscarOuCriarCliente(nome, p.telefone);

  try {
    const { id } = await repo.inserirAgendamento({
      clienteId: cliente.id,
      servicoId: servico.id,
      inicio,
      fim,
      origem: p.origem,
    });
    return { ok: true, agendamento: { id, clienteId: cliente.id, servico, inicio, fim } };
  } catch (e) {
    if (e instanceof ErroHorarioOcupado) {
      const agora = await verHorarios(repo, servico, p.data, p.agora, p.antecedenciaMin);
      return {
        ok: false,
        erro: `O horário ${hora} acabou de ser ocupado.`,
        livres: agora.horarios,
      };
    }
    throw e;
  }
}

/** Status que o dono pode aplicar a partir de cada status atual. */
const TRANSICOES: Record<Status, Status[]> = {
  confirmado: ["cancelado", "concluido", "faltou"],
  concluido: ["confirmado"],
  faltou: ["confirmado"],
  cancelado: [],
};

export function podeMudarStatus(de: Status, para: Status): boolean {
  return TRANSICOES[de]?.includes(para) ?? false;
}
