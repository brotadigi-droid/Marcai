import type { Metadata } from "next";
import { BotaoAcao, FormAcao } from "@/components/FormAcao";
import { Voltar } from "@/components/painel/Voltar";
import { botaoDiscreto, botaoEstrutura, campo, cartao, rotulo } from "@/components/ui";
import { formatarDuracao, formatarPreco } from "@/lib/formatos";
import { negocioAtual } from "@/lib/painel/sessao";
import { alternarServico, salvarServico } from "../acoes";

export const metadata: Metadata = { title: "Serviços · Marcaí" };

function Campos({ s }: { s?: { nome: string; duracao_min: number; preco_centavos: number } }) {
  const preco = s ? (s.preco_centavos / 100).toFixed(2).replace(".", ",").replace(",00", "") : "";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <label className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
        <span className={rotulo}>Nome</span>
        <input
          className={campo}
          name="nome"
          defaultValue={s?.nome}
          required
          maxLength={80}
          placeholder="Escova"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Duração (min)</span>
        <input
          className={campo}
          name="duracao"
          type="number"
          inputMode="numeric"
          min={5}
          max={720}
          step={5}
          defaultValue={s?.duracao_min ?? 30}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={rotulo}>Preço (R$)</span>
        <input
          className={campo}
          name="preco"
          inputMode="decimal"
          defaultValue={preco}
          required
          placeholder="50"
        />
      </label>
    </div>
  );
}

export default async function Servicos() {
  const { negocio, db } = await negocioAtual();
  const { data: servicos } = await db
    .from("servicos")
    .select("id, nome, duracao_min, preco_centavos, ativo")
    .eq("negocio_id", negocio.id)
    .order("ativo", { ascending: false })
    .order("nome");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
      <Voltar />
      <div>
        <h1 className="text-titulo">Serviços</h1>
        <p className="mt-1 text-texto-suave">
          A atendente só oferece serviços ativos, com estes preços e durações.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {servicos?.map((s) => (
          <li key={s.id} className={`${cartao} ${s.ativo ? "" : "opacity-70"}`}>
            <details className="group">
              <summary className="flex min-h-toque cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.nome}</span>
                  <span className="text-legenda text-texto-suave tabular-nums">
                    {formatarDuracao(s.duracao_min)} · {formatarPreco(s.preco_centavos)}
                    {s.ativo ? "" : " · pausado"}
                  </span>
                </span>
                <span className="text-legenda font-semibold text-texto-suave group-open:hidden">
                  Editar
                </span>
                <span className="hidden text-legenda font-semibold text-texto-suave group-open:inline">
                  Fechar
                </span>
              </summary>
              <div className="flex flex-col gap-3 border-t border-linha p-3">
                <FormAcao
                  acao={salvarServico}
                  botao="Salvar"
                  enviando="Salvando…"
                  classeBotao={botaoEstrutura}
                >
                  <input type="hidden" name="id" value={s.id} />
                  <Campos s={s} />
                </FormAcao>
                <BotaoAcao
                  acao={alternarServico}
                  campos={{ id: s.id, ativo: String(!s.ativo) }}
                  className={`${botaoDiscreto} -ml-3`}
                >
                  {s.ativo ? "Pausar serviço" : "Reativar serviço"}
                </BotaoAcao>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section aria-labelledby="novo" className={`${cartao} flex flex-col gap-3 p-4`}>
        <h2 id="novo" className="text-subtitulo">
          Novo serviço
        </h2>
        <FormAcao acao={salvarServico} botao="Adicionar serviço" enviando="Adicionando…">
          <Campos />
        </FormAcao>
      </section>
    </main>
  );
}
