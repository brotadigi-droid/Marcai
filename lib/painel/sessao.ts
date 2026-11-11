import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type Negocio = {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
  endereco: string | null;
  fuso: string;
  nome_atendente: string;
  tom_voz: string | null;
  avisos: string | null;
  cor_principal: string;
  cor_destaque: string;
  cantos: "retos" | "suaves" | "redondos";
  fundo: "claro" | "escuro";
};

const CAMPOS_NEGOCIO =
  "id, nome, slug, tipo, endereco, fuso, nome_atendente, tom_voz, avisos, cor_principal, cor_destaque, cantos, fundo";

/** Usuário logado (lido do token, validado pelo Supabase). Sem login, vai para /entrar. */
export const usuarioAtual = cache(async () => {
  const db = await criarClienteServidor();
  const { data } = await db.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/entrar");
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
});

/** Negócio do usuário logado. Sem negócio, vai para /comecar. */
export const negocioAtual = cache(async () => {
  const usuario = await usuarioAtual();
  const db = await criarClienteServidor();
  const { data, error } = await db
    .from("membros")
    .select(`papel, negocios (${CAMPOS_NEGOCIO})`)
    .eq("user_id", usuario.id)
    .order("criado_em")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const negocio = data?.negocios as unknown as Negocio | null | undefined;
  if (!negocio) redirect("/comecar");
  return { usuario, negocio, db };
});

/** Para quem já tem negócio não cair de novo no /comecar. */
export async function temNegocio(): Promise<boolean> {
  const usuario = await usuarioAtual();
  const db = await criarClienteServidor();
  const { count } = await db
    .from("membros")
    .select("negocio_id", { count: "exact", head: true })
    .eq("user_id", usuario.id);
  return (count ?? 0) > 0;
}
