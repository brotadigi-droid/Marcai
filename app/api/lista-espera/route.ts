import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/** Inscrição na lista de espera do site. Grava pela função entrar_lista_espera (insert-only). */
const Inscricao = z.object({
  nome: z.string().trim().min(2).max(120),
  negocio: z.string().trim().min(2).max(120),
  tipo: z.string().trim().max(40).optional().default(""),
  cidade: z.string().trim().max(80).optional().default(""),
  whatsapp: z.string().trim().max(30),
  plano: z.string().trim().max(40).optional().default(""),
});

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);
  const lido = Inscricao.safeParse(corpo);
  if (!lido.success) {
    return Response.json({ erro: "Preencha seu nome e o nome do negócio." }, { status: 400 });
  }
  const d = lido.data;
  if (d.whatsapp.replace(/\D/g, "").length < 10) {
    return Response.json(
      { erro: "Digite o WhatsApp com DDD, por exemplo (21) 90000-0000." },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.rpc("entrar_lista_espera", {
    p_nome: d.nome,
    p_negocio: d.negocio,
    p_tipo: d.tipo,
    p_cidade: d.cidade,
    p_whatsapp: d.whatsapp,
    p_plano: d.plano,
  });
  if (error) {
    console.error("lista de espera", error.message);
    return Response.json(
      { erro: "Não foi possível salvar agora. Tente de novo em instantes." },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}
