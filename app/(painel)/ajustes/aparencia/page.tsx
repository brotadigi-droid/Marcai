import type { Metadata } from "next";
import { Voltar } from "@/components/painel/Voltar";
import { negocioAtual } from "@/lib/painel/sessao";
import { Editor } from "./Editor";

export const metadata: Metadata = { title: "Aparência · Marcaí" };

export default async function Aparencia() {
  const { negocio: n } = await negocioAtual();
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:py-10">
      <Voltar />
      <div>
        <h1 className="text-titulo">Aparência</h1>
        <p className="mt-1 text-texto-suave">
          Vale para o seu painel e para a sua página de agendamento.
        </p>
      </div>
      <Editor
        inicial={{
          cor_principal: n.cor_principal,
          cor_destaque: n.cor_destaque,
          fundo: n.fundo,
          cantos: n.cantos,
        }}
        atendente={n.nome_atendente}
        negocio={n.nome}
      />
    </main>
  );
}
