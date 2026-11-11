import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/**
 * Destino do link mágico.
 * - token_hash: funciona mesmo abrindo o e-mail em outro aparelho (modelo de e-mail ajustado).
 * - code: fluxo padrão do Supabase (precisa abrir no mesmo navegador que pediu o link).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await criarClienteServidor();

  let ok = false;
  if (tokenHash && tipo) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? "/hoje" : "/entrar?erro=link", origin));
}
