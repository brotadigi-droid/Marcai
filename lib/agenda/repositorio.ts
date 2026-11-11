import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ErroHorarioOcupado, type RepositorioAgenda, type Status } from "./agendar";

const CODIGO_EXCLUSION_VIOLATION = "23P01";
const CODIGO_UNIQUE_VIOLATION = "23505";

/** RepositorioAgenda real, sobre o Supabase. As regras de acesso (RLS) valem para o cliente usado. */
export function repositorioSupabase(
  db: SupabaseClient,
  negocioId: string,
  fuso: string,
): RepositorioAgenda {
  return {
    fuso,

    async buscarServico(servicoId) {
      const { data, error } = await db
        .from("servicos")
        .select("id, nome, duracao_min, preco_centavos, ativo")
        .eq("negocio_id", negocioId)
        .eq("id", servicoId)
        .maybeSingle();
      if (error) throw error;
      return data
        ? {
            id: data.id,
            nome: data.nome,
            duracaoMin: data.duracao_min,
            precoCentavos: data.preco_centavos,
            ativo: data.ativo,
          }
        : null;
    },

    async buscarHorarios() {
      const { data, error } = await db
        .from("horarios_funcionamento")
        .select("dia_semana, abre, fecha, pausa_inicio, pausa_fim")
        .eq("negocio_id", negocioId);
      if (error) throw error;
      return data.map((h) => ({
        diaSemana: h.dia_semana,
        abre: h.abre,
        fecha: h.fecha,
        pausaInicio: h.pausa_inicio,
        pausaFim: h.pausa_fim,
      }));
    },

    async buscarOcupados(inicio, fim) {
      const [bloq, ag] = await Promise.all([
        db
          .from("bloqueios")
          .select("inicio, fim")
          .eq("negocio_id", negocioId)
          .lt("inicio", fim.toISOString())
          .gt("fim", inicio.toISOString()),
        db
          .from("agendamentos")
          .select("inicio, fim")
          .eq("negocio_id", negocioId)
          .eq("status", "confirmado")
          .lt("inicio", fim.toISOString())
          .gt("fim", inicio.toISOString()),
      ]);
      if (bloq.error) throw bloq.error;
      if (ag.error) throw ag.error;
      const paraIntervalo = (r: { inicio: string; fim: string }) => ({
        inicio: new Date(r.inicio),
        fim: new Date(r.fim),
      });
      return { bloqueios: bloq.data.map(paraIntervalo), agendamentos: ag.data.map(paraIntervalo) };
    },

    async buscarOuCriarCliente(nome, telefone) {
      const existente = await db
        .from("clientes")
        .select("id, nome")
        .eq("negocio_id", negocioId)
        .eq("telefone", telefone)
        .maybeSingle();
      if (existente.error) throw existente.error;
      if (existente.data) return existente.data;

      const novo = await db
        .from("clientes")
        .insert({ negocio_id: negocioId, nome, telefone })
        .select("id, nome")
        .single();
      if (novo.error?.code === CODIGO_UNIQUE_VIOLATION) {
        // Outra requisição criou o mesmo cliente agora há pouco.
        const de_novo = await db
          .from("clientes")
          .select("id, nome")
          .eq("negocio_id", negocioId)
          .eq("telefone", telefone)
          .single();
        if (de_novo.error) throw de_novo.error;
        return de_novo.data;
      }
      if (novo.error) throw novo.error;
      return novo.data;
    },

    async inserirAgendamento(a) {
      const { data, error } = await db
        .from("agendamentos")
        .insert({
          negocio_id: negocioId,
          cliente_id: a.clienteId,
          servico_id: a.servicoId,
          inicio: a.inicio.toISOString(),
          fim: a.fim.toISOString(),
          origem: a.origem,
        })
        .select("id")
        .single();
      if (error?.code === CODIGO_EXCLUSION_VIOLATION) throw new ErroHorarioOcupado();
      if (error) throw error;
      return data;
    },

    async mudarStatus(agendamentoId, status: Status) {
      const { data, error } = await db
        .from("agendamentos")
        .update({ status })
        .eq("negocio_id", negocioId)
        .eq("id", agendamentoId)
        .select("id");
      if (error?.code === CODIGO_EXCLUSION_VIOLATION) throw new ErroHorarioOcupado();
      if (error) throw error;
      return data.length > 0;
    },
  };
}
