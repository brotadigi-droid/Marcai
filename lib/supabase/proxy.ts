import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Páginas que exigem login. */
const PROTEGIDAS = ["/hoje", "/agenda", "/ajustes", "/comecar"];

/** Renova a sessão do Supabase a cada requisição e manda para /entrar quem não está logado. */
export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([k, v]) => resposta.headers.set(k, v));
        },
      },
    },
  );

  // Não coloque código entre createServerClient e getClaims (recomendação do Supabase).
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims?.sub);

  const caminho = request.nextUrl.pathname;
  if (!logado && PROTEGIDAS.some((p) => caminho === p || caminho.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    const r = NextResponse.redirect(url);
    resposta.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }

  return resposta;
}
