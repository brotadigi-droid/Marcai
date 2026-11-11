import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormAcao } from "@/components/FormAcao";
import { Logo } from "@/components/Logo";
import { campo, rotulo } from "@/components/ui";
import { temNegocio } from "@/lib/painel/sessao";
import { criarNegocio } from "./acoes";

export const metadata: Metadata = { title: "Criar meu negócio · Marcaí" };

const TIPOS = [
  ["salao", "Salão de beleza"],
  ["manicure", "Manicure e pedicure"],
  ["estetica", "Clínica de estética"],
  ["barbearia", "Barbearia"],
  ["sobrancelha", "Sobrancelha e cílios"],
  ["outro", "Outro"],
];

async function Formulario() {
  if (await temNegocio()) redirect("/hoje");
  return (
    <FormAcao acao={criarNegocio} botao="Criar meu negócio" enviando="Criando…">
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Nome do negócio</span>
        <input className={campo} name="nome" required maxLength={80} placeholder="Studio Ana Luz" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Tipo</span>
        <select className={campo} name="tipo" required defaultValue="">
          <option value="" disabled>
            Escolha
          </option>
          {TIPOS.map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Endereço da sua página de agendamento</span>
        <div className="flex items-center gap-1 rounded-botao border border-linha bg-superficie pl-3.5 focus-within:border-texto">
          <span className="text-corpo text-texto-suave">marcai.app/</span>
          <input
            className="min-h-toque w-full min-w-0 bg-transparent pr-3.5 outline-none"
            name="slug"
            maxLength={60}
            placeholder="studio-ana-luz"
            autoCapitalize="none"
          />
        </div>
        <span className="text-legenda text-texto-suave">
          Se deixar em branco, usamos o nome do negócio.
        </span>
      </label>
    </FormAcao>
  );
}

export default function Comecar() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10">
        <Logo />
        <div>
          <h1 className="text-titulo">Criar meu negócio</h1>
          <p className="mt-2 text-corpo text-texto-suave">
            Já deixamos horários e alguns serviços prontos. Você ajusta tudo depois, em Ajustes.
          </p>
        </div>
        <Suspense fallback={<p className="text-texto-suave">Carregando…</p>}>
          <Formulario />
        </Suspense>
      </div>
    </main>
  );
}
