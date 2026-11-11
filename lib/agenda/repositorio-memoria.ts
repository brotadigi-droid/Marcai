/** RepositorioAgenda em memória, para testes (e, na Etapa 4, para testar as tools da Lia). */
import {
  ErroHorarioOcupado,
  type Origem,
  type RepositorioAgenda,
  type Servico,
  type Status,
} from "./agendar";
import type { HorarioFuncionamento, Intervalo } from "./disponibilidade";

export type AgendamentoMemoria = Intervalo & {
  id: string;
  clienteId: string;
  servicoId: string;
  origem: Origem;
  status: Status;
};

export function repositorioMemoria(inicial: {
  fuso?: string;
  servicos: Servico[];
  horarios: HorarioFuncionamento[];
  bloqueios?: Intervalo[];
  agendamentos?: AgendamentoMemoria[];
}) {
  let seq = 0;
  const estado = {
    servicos: inicial.servicos,
    horarios: inicial.horarios,
    bloqueios: inicial.bloqueios ?? [],
    agendamentos: inicial.agendamentos ?? [],
    clientes: [] as { id: string; nome: string; telefone: string }[],
  };
  const toca = (a: Intervalo, inicio: Date, fim: Date) => a.inicio < fim && inicio < a.fim;

  const repo: RepositorioAgenda = {
    fuso: inicial.fuso ?? "America/Sao_Paulo",
    async buscarServico(id) {
      return estado.servicos.find((s) => s.id === id) ?? null;
    },
    async buscarHorarios() {
      return estado.horarios;
    },
    async buscarOcupados(inicio, fim) {
      return {
        bloqueios: estado.bloqueios.filter((b) => toca(b, inicio, fim)),
        agendamentos: estado.agendamentos.filter(
          (a) => a.status === "confirmado" && toca(a, inicio, fim),
        ),
      };
    },
    async buscarOuCriarCliente(nome, telefone) {
      const c = estado.clientes.find((x) => x.telefone === telefone);
      if (c) return c;
      const novo = { id: `cli-${++seq}`, nome, telefone };
      estado.clientes.push(novo);
      return novo;
    },
    async inserirAgendamento(a) {
      // Simula a exclusion constraint do banco.
      if (estado.agendamentos.some((x) => x.status === "confirmado" && toca(x, a.inicio, a.fim))) {
        throw new ErroHorarioOcupado();
      }
      const novo = { ...a, id: `ag-${++seq}`, status: "confirmado" as const };
      estado.agendamentos.push(novo);
      return { id: novo.id };
    },
    async mudarStatus(id, status) {
      const a = estado.agendamentos.find((x) => x.id === id);
      if (!a) return false;
      a.status = status;
      return true;
    },
  };
  return { repo, estado };
}
