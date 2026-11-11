"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { EstadoAcao } from "@/components/FormAcao";
import { paraMinutos } from "@/lib/agenda/fuso";
import { lerPreco } from "@/lib/formatos";
import { negocioAtual } from "@/lib/painel/sessao";

const ERRO_GENERICO = { erro: "Não foi possível salvar agora. Tente de novo." };

// ---------------------------------------------------------------- Serviços

const esquemaServico = z.object({
  nome: z.string().trim().min(2, "O nome do serviço precisa de pelo menos 2 letras.").max(80),
  duracao: z.coerce
    .number({ error: "Informe a duração em minutos." })
    .int()
    .min(5, "A duração mínima é 5 minutos.")
    .max(720, "A duração máxima é 12 horas."),
  preco: z.number({ error: "Informe o preço, por exemplo 50 ou 49,90." }).min(0),
});

function lerServico(dados: FormData) {
  return esquemaServico.safeParse({
    nome: dados.get("nome"),
    duracao: dados.get("duracao"),
    preco: lerPreco(String(dados.get("preco") ?? "")) ?? undefined,
  });
}

export async function salvarServico(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const r = lerServico(dados);
  if (!r.success) return { erro: r.error.issues[0].message };
  const { negocio, db } = await negocioAtual();
  const id = String(dados.get("id") ?? "");
  const linha = { nome: r.data.nome, duracao_min: r.data.duracao, preco_centavos: r.data.preco };
  const { error } = id
    ? await db.from("servicos").update(linha).eq("negocio_id", negocio.id).eq("id", id)
    : await db.from("servicos").insert({ ...linha, negocio_id: negocio.id });
  if (error) return ERRO_GENERICO;
  refresh();
  return { ok: id ? "Salvo" : `${r.data.nome} adicionado` };
}

export async function alternarServico(dados: FormData) {
  const { negocio, db } = await negocioAtual();
  await db
    .from("servicos")
    .update({ ativo: dados.get("ativo") === "true" })
    .eq("negocio_id", negocio.id)
    .eq("id", String(dados.get("id")));
  refresh();
}

// ---------------------------------------------------------------- Horários

const hora = z.string().regex(/^\d{2}:\d{2}$/);

export async function salvarHorarios(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const linhas: {
    dia_semana: number;
    abre: string;
    fecha: string;
    pausa_inicio: string | null;
    pausa_fim: string | null;
  }[] = [];
  const nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  for (let d = 0; d < 7; d++) {
    if (dados.get(`aberto_${d}`) !== "on") continue;
    const abre = String(dados.get(`abre_${d}`) ?? "");
    const fecha = String(dados.get(`fecha_${d}`) ?? "");
    const pi = String(dados.get(`pausa_inicio_${d}`) ?? "");
    const pf = String(dados.get(`pausa_fim_${d}`) ?? "");
    if (!hora.safeParse(abre).success || !hora.safeParse(fecha).success) {
      return { erro: `Preencha abertura e fechamento de ${nomes[d]}.` };
    }
    if (paraMinutos(abre) >= paraMinutos(fecha)) {
      return { erro: `Em ${nomes[d]}, o fechamento precisa ser depois da abertura.` };
    }
    const temPausa = Boolean(pi || pf);
    if (temPausa) {
      if (!hora.safeParse(pi).success || !hora.safeParse(pf).success) {
        return {
          erro: `Em ${nomes[d]}, preencha o início e o fim do almoço, ou deixe os dois vazios.`,
        };
      }
      const [a, f, i, t] = [abre, fecha, pi, pf].map(paraMinutos);
      if (!(a <= i && i < t && t <= f)) {
        return { erro: `Em ${nomes[d]}, o almoço precisa ficar dentro do horário de atendimento.` };
      }
    }
    linhas.push({
      dia_semana: d,
      abre,
      fecha,
      pausa_inicio: temPausa ? pi : null,
      pausa_fim: temPausa ? pf : null,
    });
  }

  const { negocio, db } = await negocioAtual();
  const fechados = [0, 1, 2, 3, 4, 5, 6].filter((d) => !linhas.some((l) => l.dia_semana === d));
  if (fechados.length) {
    const del = await db
      .from("horarios_funcionamento")
      .delete()
      .eq("negocio_id", negocio.id)
      .in("dia_semana", fechados);
    if (del.error) return ERRO_GENERICO;
  }
  if (linhas.length) {
    const up = await db.from("horarios_funcionamento").upsert(
      linhas.map((l) => ({ ...l, negocio_id: negocio.id })),
      { onConflict: "negocio_id,dia_semana" },
    );
    if (up.error) return ERRO_GENERICO;
  }
  refresh();
  return { ok: "Horários salvos" };
}

// ---------------------------------------------------------------- Aparência

const cor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Escolha uma cor válida.");
const esquemaAparencia = z.object({
  cor_principal: cor,
  cor_destaque: cor,
  fundo: z.enum(["claro", "escuro"]),
  cantos: z.enum(["retos", "suaves", "redondos"]),
});

export async function salvarAparencia(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const r = esquemaAparencia.safeParse(Object.fromEntries(dados));
  if (!r.success) return { erro: r.error.issues[0].message };
  const { negocio, db } = await negocioAtual();
  const { error } = await db
    .from("negocios")
    .update({
      ...r.data,
      cor_principal: r.data.cor_principal.toUpperCase(),
      cor_destaque: r.data.cor_destaque.toUpperCase(),
    })
    .eq("id", negocio.id);
  if (error) return ERRO_GENERICO;
  refresh();
  return { ok: "Aparência salva" };
}

// ---------------------------------------------------------------- Negócio

const esquemaNegocio = z.object({
  nome: z.string().trim().min(2, "O nome precisa de pelo menos 2 letras.").max(80),
  endereco: z.string().trim().max(200),
  nome_atendente: z.string().trim().min(1, "Dê um nome para a atendente.").max(40),
  tom_voz: z.string().trim().max(300),
  avisos: z.string().trim().max(1000),
});

export async function salvarNegocio(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const r = esquemaNegocio.safeParse(Object.fromEntries(dados));
  if (!r.success) return { erro: r.error.issues[0].message };
  const { negocio, db } = await negocioAtual();
  const { error } = await db
    .from("negocios")
    .update({
      nome: r.data.nome,
      endereco: r.data.endereco || null,
      nome_atendente: r.data.nome_atendente,
      tom_voz: r.data.tom_voz || null,
      avisos: r.data.avisos || null,
    })
    .eq("id", negocio.id);
  if (error) return ERRO_GENERICO;
  refresh();
  return { ok: "Dados salvos" };
}
