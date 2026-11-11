import type { Metadata } from "next";
import Link from "next/link";
import { Legenda, LinhaBloqueioItem, LinhaHorario } from "@/components/painel/Horarios";
import { botaoDiscreto, botaoPrincipal, botaoSecundario } from "@/components/ui";
import { dataNoFuso, diaDaSemana, limitesDoDia, semanaDe, somarDias } from "@/lib/agenda/fuso";
import { DIAS_CURTOS, diaEMes, rotuloDia } from "@/lib/agenda/rotulos";
import { carregarAgenda } from "@/lib/painel/agenda";
import { diaDaBusca } from "@/lib/painel/datas";
import { negocioAtual } from "@/lib/painel/sessao";

export const metadata: Metadata = { title: "Agenda · Marcaí" };

export default async function Agenda({ searchParams }: PageProps<"/agenda">) {
  const busca = await searchParams;
  const { negocio, db } = await negocioAtual();
  const fuso = negocio.fuso;
  const hoje = dataNoFuso(new Date(), fuso);
  const dia = diaDaBusca(busca.dia, fuso);
  const semana = semanaDe(dia);

  const inicioSemana = limitesDoDia(semana[0], fuso).inicio;
  const fimSemana = limitesDoDia(semana[6], fuso).fim;
  const [{ agendamentos, bloqueios }, horarios] = await Promise.all([
    carregarAgenda(db, negocio.id, inicioSemana, fimSemana),
    db.from("horarios_funcionamento").select("dia_semana").eq("negocio_id", negocio.id),
  ]);
  const diasAbertos = new Set((horarios.data ?? []).map((h) => h.dia_semana));

  const doDia = (d: string) => {
    const { inicio, fim } = limitesDoDia(d, fuso);
    return {
      ags: agendamentos.filter((a) => a.inicio >= inicio && a.inicio < fim),
      bls: bloqueios.filter((b) => b.inicio < fim && b.fim > inicio),
      inicio,
      fim,
    };
  };
  const selecionado = doDia(dia);
  const aberto = diasAbertos.has(diaDaSemana(dia));
  const itens = [
    ...selecionado.ags.map((a) => ({ tipo: "ag" as const, quando: a.inicio, a })),
    ...selecionado.bls.map((b) => ({ tipo: "bl" as const, quando: b.inicio, b })),
  ].sort((x, y) => x.quando.getTime() - y.quando.getTime());

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-titulo">Agenda</h1>
        <div className="flex items-center gap-1">
          <Link
            href={`/agenda?dia=${somarDias(semana[0], -7)}`}
            className={botaoDiscreto}
            aria-label="Semana anterior"
          >
            ←
          </Link>
          <span className="min-w-28 text-center font-semibold tabular-nums">
            {diaEMes(semana[0])} a {diaEMes(semana[6])}
          </span>
          <Link
            href={`/agenda?dia=${somarDias(semana[0], 7)}`}
            className={botaoDiscreto}
            aria-label="Próxima semana"
          >
            →
          </Link>
        </div>
      </header>

      <nav aria-label="Dias da semana" className="grid grid-cols-7 gap-1">
        {semana.map((d) => {
          const { ags } = doDia(d);
          const qtd = ags.filter((a) => a.status === "confirmado").length;
          const fechado = !diasAbertos.has(diaDaSemana(d));
          return (
            <Link
              key={d}
              href={`/agenda?dia=${d}`}
              aria-current={d === dia ? "date" : undefined}
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-botao border border-transparent bg-superficie py-2 text-center transition hover:border-linha aria-[current=date]:bg-marinho aria-[current=date]:text-sobre-marinho"
            >
              <span className="text-legenda uppercase opacity-80">
                {DIAS_CURTOS[diaDaSemana(d)]}
              </span>
              <span
                className={`text-subtitulo leading-none tabular-nums ${d === hoje ? "underline underline-offset-4" : ""}`}
              >
                {Number(d.slice(8))}
              </span>
              <span className="text-[11px] leading-none opacity-80">
                {fechado ? "fechado" : qtd ? `${qtd}` : "·"}
              </span>
            </Link>
          );
        })}
      </nav>

      <section aria-labelledby="dia" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="dia" className="text-subtitulo">
            {rotuloDia(dia, hoje)}
          </h2>
          <div className="flex gap-2">
            <Link href={`/agenda/bloquear?dia=${dia}`} className={botaoSecundario}>
              Bloquear
            </Link>
            {aberto && (
              <Link href={`/agenda/marcar?dia=${dia}`} className={botaoPrincipal}>
                Marcar horário
              </Link>
            )}
          </div>
        </div>
        <Legenda />
        {!aberto && (
          <p className="rounded-cartao bg-cinza-suave p-4">
            Fechado neste dia. Para abrir, mude em{" "}
            <Link href="/ajustes/horarios" className="font-semibold underline">
              Ajustes → Horários
            </Link>
            .
          </p>
        )}
        {itens.length ? (
          <ul className="flex flex-col gap-2">
            {itens.map((i) =>
              i.tipo === "ag" ? (
                <LinhaHorario
                  key={i.a.id}
                  a={i.a}
                  fuso={fuso}
                  destaque={busca.marcado === i.a.id}
                />
              ) : (
                <LinhaBloqueioItem
                  key={i.b.id}
                  b={i.b}
                  fuso={fuso}
                  diaInteiro={i.b.inicio <= selecionado.inicio && i.b.fim >= selecionado.fim}
                />
              ),
            )}
          </ul>
        ) : (
          aberto && (
            <p className="rounded-cartao bg-superficie p-4 text-texto-suave">
              Nenhum horário marcado neste dia ainda.
            </p>
          )
        )}
      </section>
    </main>
  );
}
