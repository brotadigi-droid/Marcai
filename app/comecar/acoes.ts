"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoAcao } from "@/components/FormAcao";
import { paraSlug } from "@/lib/formatos";
import { usuarioAtual } from "@/lib/painel/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const TIPOS = ["salao", "manicure", "estetica", "barbearia", "sobrancelha", "outro"] as const;

const esquema = z.object({
  nome: z.string().trim().min(2, "O nome precisa de pelo menos 2 letras.").max(80),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use só letras, números e hífen no endereço.")
    .max(60),
  tipo: z.enum(TIPOS, { error: "Escolha o tipo do negócio." }),
});

export async function criarNegocio(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  await usuarioAtual();
  const nome = String(dados.get("nome") ?? "");
  const r = esquema.safeParse({
    nome,
    slug: paraSlug(String(dados.get("slug") || nome)),
    tipo: dados.get("tipo"),
  });
  if (!r.success) return { erro: r.error.issues[0].message };

  const db = await criarClienteServidor();
  const { error } = await db.rpc("criar_negocio", {
    p_nome: r.data.nome,
    p_slug: r.data.slug,
    p_tipo: r.data.tipo,
  });
  if (error?.code === "23505")
    return { erro: `O endereço marcai.app/${r.data.slug} já está em uso. Escolha outro.` };
  if (error?.code === "P0001") redirect("/hoje");
  if (error) return { erro: "Não foi possível criar o negócio agora. Tente de novo." };
  redirect("/hoje");
}
