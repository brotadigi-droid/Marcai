import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Origem = "ia" | "dono" | "link";

export type LinhaAgenda = {
  id: string;
  inicio: Date;
  fim: Date;
  status: "confirmado" | "cancelado" | "concluido" | "faltou";
  origem: Origem;
  cliente: { nome: string; telefone: string };
  servico: { nome: string; precoCentavos: number };
};

export type LinhaBloqueio = { id: string; inicio: Date; fim: Date; motivo: string | null };

/** Agendamentos (menos os cancelados) e bloqueios de um intervalo. */
export async function carregarAgenda(
  db: SupabaseClient,
  negocioId: string,
  inicio: Date,
  fim: Date,
) {
  const [ag, bl] = await Promise.all([
    db
      .from("agendamentos")
      .select(
        "id, inicio, fim, status, origem, clientes (nome, telefone), servicos (nome, preco_centavos)",
      )
      .eq("negocio_id", negocioId)
      .neq("status", "cancelado")
      .gte("inicio", inicio.toISOString())
      .lt("inicio", fim.toISOString())
      .order("inicio"),
    db
      .from("bloqueios")
      .select("id, inicio, fim, motivo")
      .eq("negocio_id", negocioId)
      .lt("inicio", fim.toISOString())
      .gt("fim", inicio.toISOString())
      .order("inicio"),
  ]);
  if (ag.error) throw ag.error;
  if (bl.error) throw bl.error;

  const agendamentos: LinhaAgenda[] = ag.data.map((r) => {
    const c = r.clientes as unknown as { nome: string; telefone: string };
    const s = r.servicos as unknown as { nome: string; preco_centavos: number };
    return {
      id: r.id,
      inicio: new Date(r.inicio),
      fim: new Date(r.fim),
      status: r.status,
      origem: r.origem,
      cliente: { nome: c.nome, telefone: c.telefone },
      servico: { nome: s.nome, precoCentavos: s.preco_centavos },
    };
  });
  const bloqueios: LinhaBloqueio[] = bl.data.map((b) => ({
    id: b.id,
    inicio: new Date(b.inicio),
    fim: new Date(b.fim),
    motivo: b.motivo,
  }));
  return { agendamentos, bloqueios };
}

/** Cor da etiqueta de horário conforme quem marcou. */
export const COR_ORIGEM: Record<Origem, string> = {
  ia: "bg-ciano-gelo",
  dono: "bg-cinza-suave",
  link: "bg-azul-suave",
};

export const NOME_ORIGEM: Record<Origem, string> = {
  ia: "pela atendente",
  dono: "por você",
  link: "pelo link",
};
