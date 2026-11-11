import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/** Cliente do Supabase com a sessão do usuário logado. As regras de acesso (RLS) valem para ele. */
export async function criarClienteServidor() {
  // Sessão e horário atual são sempre do momento do pedido: nada aqui pode ser pré-renderizado.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component: não dá para gravar cookies aqui.
            // O proxy.ts renova a sessão a cada requisição, então pode ignorar.
          }
        },
      },
    },
  );
}
