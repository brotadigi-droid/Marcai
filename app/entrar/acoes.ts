"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoAcao } from "@/components/FormAcao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const esquema = z.object({ email: z.email() });

/** Envia o link mágico. Cria a conta na primeira vez. */
export async function enviarLink(_: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const r = esquema.safeParse({
    email: String(dados.get("email") ?? "")
      .trim()
      .toLowerCase(),
  });
  if (!r.success) return { erro: "Digite um e-mail válido, por exemplo ana@gmail.com." };

  const h = await headers();
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? h.get("origin") ?? `https://${h.get("host")}`;
  const db = await criarClienteServidor();
  const { error } = await db.auth.signInWithOtp({
    email: r.data.email,
    options: { emailRedirectTo: `${origem}/auth/confirmar`, shouldCreateUser: true },
  });
  if (error?.status === 429) {
    return { erro: "Muitos pedidos de link agora. Espere alguns minutos e tente de novo." };
  }
  if (error) return { erro: "Não foi possível enviar o link. Confira o e-mail e tente de novo." };
  return {
    ok: `Pronto! Mandamos um link para ${r.data.email}. Abra o e-mail e toque em "Entrar".`,
  };
}

export async function sair() {
  const db = await criarClienteServidor();
  await db.auth.signOut();
  redirect("/entrar");
}
