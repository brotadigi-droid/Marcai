import Link from "next/link";
import { Logo } from "@/components/Logo";
import { botaoEstrutura } from "@/components/ui";

export default function Inicio() {
  return (
    <main className="flex flex-1 flex-col bg-sol">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-12">
        <Logo />
        <h1 className="max-w-[14ch] text-display">Seu cliente pede. A Marcaí marca.</h1>
        <p className="max-w-[32ch] text-subtitulo font-medium">
          A atendente que responde no WhatsApp, mostra os horários livres e já deixa marcado.
        </p>
        <Link href="/hoje" className={`${botaoEstrutura} self-start`}>
          Entrar no painel
        </Link>
      </div>
    </main>
  );
}
