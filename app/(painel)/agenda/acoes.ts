"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoAcao } from "@/components/FormAcao";
import {
  ErroHorarioOcupado,
  marcarHorario,
  podeMudarStatus,
  type Status,
} from "@/lib/agenda/agendar";
import { instanteLocal, lerData, limitesDoDia, paraMinutos } from "@/lib/agenda/fuso";
import { repositorioSupabase } from "@/lib/agenda/repositorio";
import { telefoneParaE164 } from "@/lib/formatos";
import { negocioAtual } from "@/lib/painel/sessao";

const STATUS = ["confirmado", "cancelado", "concluido", "faltou"] as const;

/** Cancelar, finalizar, marcar falta ou desfazer. */
export async function mudarStatus(dados: FormData) {
  const r = z.object({ id: z.uuid(), status: z.enum(STATUS) }).safeParse({
    id: dados.get("id"),
    status: dados.get("status"),
  });
  if (!r.success) return;
  const { negocio, db } = await negocioAtual();

  const atual = await db
    .from("agendamentos")
    .select("status")
    .eq("negocio_id", negocio.id)
    .eq("id", r.data.id)
    .maybeSingle();
  if (!atual.data || !podeMudarStatus(atual.data.status as Status, r.data.status)) return;

  try {
    await repositorioSupabase(db, negocio.id, negocio.fuso).mudarStatus(r.data.id, r.data.status);
  } catch (e) {
    // Desfazer uma falta pode bater num horário que já foi ocupado: nesse caso, não muda.
    if (!(e instanceof ErroHorarioOcupado)) throw e;
  }
  refresh();
}

export async function marcar(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const telefone = telefoneParaE164(String(dados.get("telefone") ?? ""));
  if (!telefone) return { erro: "Digite o WhatsApp com DDD, por exemplo (21) 99000-0000." };
  const hora = String(dados.get("hora") ?? "");
  if (!hora) return { erro: "Escolha um horário." };

  const { negocio, db } = await negocioAtual();
  const data = String(dados.get("data") ?? "");
  const r = await marcarHorario(repositorioSupabase(db, negocio.id, negocio.fuso), {
    servicoId: String(dados.get("servico") ?? ""),
    data,
    hora,
    nomeCliente: String(dados.get("nome") ?? ""),
    telefone,
    origem: "dono",
    agora: new Date(),
    antecedenciaMin: 0,
  });
  if (!r.ok) {
    const livres = r.livres?.length ? ` Livres: ${r.livres.slice(0, 6).join(", ")}.` : "";
    return { erro: r.erro + livres };
  }
  redirect(`/agenda?dia=${data}&marcado=${r.agendamento.id}`);
}

const esquemaBloqueio = z
  .object({
    data: z.string().refine((d) => {
      try {
        lerData(d);
        return true;
      } catch {
        return false;
      }
    }, "Data inválida."),
    diaInteiro: z.boolean(),
    de: z.string(),
    ate: z.string(),
    motivo: z.string().trim().max(120),
  })
  .refine(
    (b) =>
      b.diaInteiro || (/^\d{2}:\d{2}$/.test(b.de) && /^\d{2}:\d{2}$/.test(b.ate) && b.de < b.ate),
    {
      message: "O horário final precisa ser depois do inicial.",
    },
  );

export async function bloquear(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const r = esquemaBloqueio.safeParse({
    data: dados.get("data"),
    diaInteiro: dados.get("dia_inteiro") === "on",
    de: dados.get("de") ?? "",
    ate: dados.get("ate") ?? "",
    motivo: dados.get("motivo") ?? "",
  });
  if (!r.success) return { erro: r.error.issues[0].message };
  const { negocio, db } = await negocioAtual();
  const b = r.data;
  const { inicio, fim } = b.diaInteiro
    ? limitesDoDia(b.data, negocio.fuso)
    : {
        inicio: instanteLocal(b.data, paraMinutos(b.de), negocio.fuso),
        fim: instanteLocal(b.data, paraMinutos(b.ate), negocio.fuso),
      };
  const { error } = await db.from("bloqueios").insert({
    negocio_id: negocio.id,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    motivo: b.motivo || null,
  });
  if (error) return { erro: "Não foi possível bloquear agora. Tente de novo." };
  redirect(`/agenda?dia=${b.data}`);
}

export async function removerBloqueio(dados: FormData) {
  const id = z.uuid().safeParse(dados.get("id"));
  if (!id.success) return;
  const { negocio, db } = await negocioAtual();
  await db.from("bloqueios").delete().eq("negocio_id", negocio.id).eq("id", id.data);
  refresh();
}
