import type { Metadata } from "next";
import Link from "next/link";
import { BotaoAcao } from "@/components/FormAcao";
import { Legenda, LinhaHorario } from "@/components/painel/Horarios";
import { botaoDiscreto, botaoPrincipal, botaoSecundario } from "@/components/ui";
import { atendimentoAtual } from "@/lib/agenda/atendimento";
import { dataNoFuso, horaNoFuso, limitesDoDia } from "@/lib/agenda/fuso";
import { rotuloDia } from "@/lib/agenda/rotulos";
import { formatarPreco } from "@/lib/formatos";
import { carregarAgenda } from "@/lib/painel/agenda";
import { negocioAtual } from "@/lib/painel/sessao";
import { mudarStatus } from "../agenda/acoes";

export const metadata: Metadata = { title: "Hoje · Marcaí" };

export default async function Hoje() {
  const { negocio, db } = await negocioAtual();
  const agora = new Date();
  const hoje = dataNoFuso(agora, negocio.fuso);
  const { inicio, fim } = limitesDoDia(hoje, negocio.fuso);
  const { agendamentos } = await carregarAgenda(db, negocio.id, inicio, fim);

  const atual = atendimentoAtual(agendamentos, agora);
  const emFoco = atual.tipo === "livre" ? null : atual.item;
  const proximos = agendamentos.filter((a) => a.status === "confirmado" && a.id !== emFoco?.id);
  const feitos = agendamentos.filter((a) => a.status !== "confirmado");
  const previsto = agendamentos
    .filter((a) => a.status !== "faltou")
    .reduce((t, a) => t + a.servico.precoCentavos, 0);
  const hora = (d: Date) => horaNoFuso(d, negocio.fuso);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-legenda font-semibold text-texto-suave">
            {rotuloDia(hoje, hoje).toUpperCase()} · {hora(agora)}
          </p>
          <h1 className="text-titulo">{negocio.nome}</h1>
        </div>
        <Link href={`/agenda/marcar?dia=${hoje}`} className={botaoSecundario}>
          Marcar horário
        </Link>
      </header>

      <section
        aria-labelledby="agora"
        className="flex flex-col gap-4 rounded-destaque bg-petroleo p-5 text-sobre-petroleo md:p-6"
      >
        <h2 id="agora" className="text-legenda font-bold tracking-wide uppercase opacity-80">
          {atual.tipo === "atendendo"
            ? "Atendendo agora"
            : atual.tipo === "chegando"
              ? "Chegando"
              : "Agora"}
        </h2>
        {emFoco ? (
          <>
            <div>
              <p className="text-subtitulo">{emFoco.cliente.nome}</p>
              <p className="opacity-85">
                {emFoco.servico.nome} · {hora(emFoco.inicio)} às {hora(emFoco.fim)} ·{" "}
                {formatarPreco(emFoco.servico.precoCentavos)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BotaoAcao
                acao={mudarStatus}
                campos={{ id: emFoco.id, status: "concluido" }}
                className={botaoPrincipal}
              >
                {proximos.length ? "Finalizar e chamar próximo" : "Finalizar atendimento"}
              </BotaoAcao>
              <BotaoAcao
                acao={mudarStatus}
                campos={{ id: emFoco.id, status: "faltou" }}
                className="inline-flex min-h-toque items-center rounded-botao px-4 font-semibold hover:bg-white/10"
              >
                Não veio
              </BotaoAcao>
            </div>
          </>
        ) : (
          <p className="text-subtitulo">
            {atual.tipo === "livre" && atual.proximo
              ? `Ninguém agora. Próximo às ${hora(atual.proximo.inicio)}: ${atual.proximo.cliente.nome}.`
              : "Ninguém agora. A agenda de hoje está livre."}
          </p>
        )}
      </section>

      <section aria-labelledby="proximos" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="proximos" className="text-subtitulo">
            Próximos de hoje
          </h2>
          <span className="text-legenda text-texto-suave tabular-nums">
            {agendamentos.length} {agendamentos.length === 1 ? "horário" : "horários"} · previsto{" "}
            {formatarPreco(previsto)}
          </span>
        </div>
        <Legenda />
        {proximos.length ? (
          <ul className="flex flex-col gap-2">
            {proximos.map((a) => (
              <LinhaHorario key={a.id} a={a} fuso={negocio.fuso} />
            ))}
          </ul>
        ) : (
          <p className="rounded-cartao bg-superficie p-4 text-texto-suave">
            Nenhum outro horário hoje.
          </p>
        )}
      </section>

      {feitos.length > 0 && (
        <section aria-labelledby="feitos" className="flex flex-col gap-3">
          <h2 id="feitos" className="text-subtitulo">
            Já passaram
          </h2>
          <ul className="flex flex-col gap-2">
            {feitos.map((a) => (
              <LinhaHorario key={a.id} a={a} fuso={negocio.fuso} />
            ))}
          </ul>
        </section>
      )}

      <Link href="/agenda" className={`${botaoDiscreto} self-start`}>
        Ver a semana →
      </Link>
    </main>
  );
}
