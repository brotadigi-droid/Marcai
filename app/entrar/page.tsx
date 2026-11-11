import type { Metadata } from "next";
import { Suspense } from "react";
import { FormAcao } from "@/components/FormAcao";
import { Logo } from "@/components/Logo";
import { campo, rotulo } from "@/components/ui";
import { enviarLink } from "./acoes";

export const metadata: Metadata = { title: "Entrar · Marcaí" };

async function AvisoErro({ busca }: { busca: Promise<{ erro?: string }> }) {
  const { erro } = await busca;
  if (erro !== "link") return null;
  return (
    <p className="rounded-cartao bg-ambar-suave p-3 text-corpo">
      Esse link expirou ou já foi usado. Peça um novo abaixo.
    </p>
  );
}

export default function Entrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <main className="flex flex-1 flex-col bg-gelo">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-10">
        <Logo />
        <div className="flex flex-col gap-5 rounded-destaque bg-superficie p-6 shadow-[0_24px_48px_-24px_rgba(15,35,64,.35)]">
          <div>
            <h1 className="text-titulo">Entrar no painel</h1>
            <p className="mt-1 text-corpo text-texto-suave">
              Sem senha: mandamos um link para o seu e-mail.
            </p>
          </div>
          <Suspense>
            <AvisoErro busca={searchParams as Promise<{ erro?: string }>} />
          </Suspense>
          <FormAcao acao={enviarLink} botao="Mandar link de entrada" enviando="Mandando…">
            <label className="flex flex-col gap-1.5">
              <span className={rotulo}>Seu e-mail</span>
              <input
                className={campo}
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="ana@gmail.com"
              />
            </label>
          </FormAcao>
        </div>
      </div>
    </main>
  );
}
