import type { Metadata } from "next";
import { FormAcao } from "@/components/FormAcao";
import { Voltar } from "@/components/painel/Voltar";
import { campo, rotulo } from "@/components/ui";
import { negocioAtual } from "@/lib/painel/sessao";
import { salvarNegocio } from "../acoes";

export const metadata: Metadata = { title: "Negócio e atendente · Marcaí" };

const areaTexto = `${campo} min-h-24 py-2.5`;

export default async function Negocio() {
  const { negocio: n } = await negocioAtual();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:py-10">
      <Voltar />
      <h1 className="text-titulo">Negócio e atendente</h1>
      <FormAcao acao={salvarNegocio} botao="Salvar" enviando="Salvando…">
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Nome do negócio</span>
          <input className={campo} name="nome" defaultValue={n.nome} required maxLength={80} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Endereço</span>
          <input
            className={campo}
            name="endereco"
            defaultValue={n.endereco ?? ""}
            maxLength={200}
            placeholder="Rua, número, bairro, cidade"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Nome da atendente</span>
          <input
            className={campo}
            name="nome_atendente"
            defaultValue={n.nome_atendente}
            required
            maxLength={40}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Jeito de falar</span>
          <textarea
            className={areaTexto}
            name="tom_voz"
            defaultValue={n.tom_voz ?? ""}
            maxLength={300}
            placeholder="acolhedor e próximo"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Avisos para os clientes</span>
          <textarea
            className={areaTexto}
            name="avisos"
            defaultValue={n.avisos ?? ""}
            maxLength={1000}
            placeholder="Tolerância de 15 minutos. Pagamento em Pix ou cartão."
          />
          <span className="text-legenda text-texto-suave">
            A atendente lembra o cliente desses avisos depois de marcar.
          </span>
        </label>
      </FormAcao>
    </main>
  );
}
