import type { Metadata } from "next";
import Link from "next/link";
import { FormAcao } from "@/components/FormAcao";
import { botaoDiscreto, campo, rotulo } from "@/components/ui";
import { verHorarios } from "@/lib/agenda/agendar";
import { dataNoFuso } from "@/lib/agenda/fuso";
import { repositorioSupabase } from "@/lib/agenda/repositorio";
import { rotuloDia } from "@/lib/agenda/rotulos";
import { formatarDuracao, formatarPreco } from "@/lib/formatos";
import { diaDaBusca } from "@/lib/painel/datas";
import { negocioAtual } from "@/lib/painel/sessao";
import { marcar } from "../acoes";

export const metadata: Metadata = { title: "Marcar horário · Marcaí" };

export default async function Marcar({ searchParams }: PageProps<"/agenda/marcar">) {
  const busca = await searchParams;
  const { negocio, db } = await negocioAtual();
  const hoje = dataNoFuso(new Date(), negocio.fuso);
  const dia = diaDaBusca(busca.dia, negocio.fuso);
  const { data: servicos } = await db
    .from("servicos")
    .select("id, nome, duracao_min, preco_centavos")
    .eq("negocio_id", negocio.id)
    .eq("ativo", true)
    .order("nome");
  const servicoId = typeof busca.servico === "string" ? busca.servico : undefined;
  const servico = servicos?.find((s) => s.id === servicoId);

  const disp = servico
    ? await verHorarios(
        repositorioSupabase(db, negocio.id, negocio.fuso),
        { duracaoMin: servico.duracao_min },
        dia,
        new Date(),
        0,
      )
    : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:py-10">
      <Link href={`/agenda?dia=${dia}`} className={`${botaoDiscreto} -ml-3 self-start`}>
        ← Agenda
      </Link>
      <h1 className="text-titulo">Marcar horário</h1>

      {/* Passo 1: dia e serviço (GET, recarrega os horários livres) */}
      <form className="flex flex-col gap-4" action="/agenda/marcar">
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Dia</span>
          <input className={campo} type="date" name="dia" defaultValue={dia} min={hoje} required />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className={`${rotulo} mb-1.5`}>Serviço</legend>
          {servicos?.length ? (
            servicos.map((s) => (
              <label
                key={s.id}
                className="flex min-h-toque cursor-pointer items-center gap-3 rounded-botao border border-linha bg-superficie px-3 has-checked:border-texto has-checked:bg-ciano-gelo"
              >
                <input
                  type="radio"
                  name="servico"
                  value={s.id}
                  defaultChecked={s.id === servicoId}
                  required
                  className="size-4 accent-current"
                />
                <span className="flex-1 font-semibold">{s.nome}</span>
                <span className="text-legenda text-texto-suave tabular-nums">
                  {formatarDuracao(s.duracao_min)} · {formatarPreco(s.preco_centavos)}
                </span>
              </label>
            ))
          ) : (
            <p className="text-texto-suave">
              Nenhum serviço ativo. Cadastre em{" "}
              <Link href="/ajustes/servicos" className="underline">
                Ajustes → Serviços
              </Link>
              .
            </p>
          )}
        </fieldset>
        <button
          type="submit"
          className="inline-flex min-h-toque items-center justify-center rounded-botao border-2 border-texto px-5 font-semibold"
        >
          Ver horários livres
        </button>
      </form>

      {/* Passo 2: horário e cliente */}
      {servico && disp && (
        <section
          aria-labelledby="livres"
          className="flex flex-col gap-4 border-t border-linha pt-6"
        >
          <h2 id="livres" className="text-subtitulo">
            {servico.nome}, {rotuloDia(dia, hoje).toLowerCase()}
          </h2>
          {disp.fechado ? (
            <p className="rounded-cartao bg-cinza-suave p-4">Fechado neste dia.</p>
          ) : disp.horarios.length === 0 ? (
            <p className="rounded-cartao bg-cinza-suave p-4">
              Nenhum horário livre para este serviço neste dia.
            </p>
          ) : (
            <FormAcao acao={marcar} botao="Marcar" enviando="Marcando…">
              <input type="hidden" name="data" value={dia} />
              <input type="hidden" name="servico" value={servico.id} />
              <fieldset>
                <legend className={`${rotulo} mb-2`}>Horário</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {disp.horarios.map((h) => (
                    <label
                      key={h}
                      className="flex min-h-toque cursor-pointer items-center justify-center rounded-botao border border-linha bg-superficie font-semibold tabular-nums has-checked:border-marinho has-checked:bg-marinho has-checked:text-sobre-marinho"
                    >
                      <input type="radio" name="hora" value={h} required className="sr-only" />
                      {h}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex flex-col gap-1.5">
                <span className={rotulo}>Nome do cliente</span>
                <input
                  className={campo}
                  name="nome"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="off"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={rotulo}>WhatsApp com DDD</span>
                <input
                  className={campo}
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="(21) 99000-0000"
                />
              </label>
            </FormAcao>
          )}
        </section>
      )}
    </main>
  );
}
