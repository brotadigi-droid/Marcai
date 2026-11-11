import { BotaoAcao } from "@/components/FormAcao";
import { botaoDiscreto } from "@/components/ui";
import { horaNoFuso } from "@/lib/agenda/fuso";
import { formatarPreco, formatarTelefone } from "@/lib/formatos";
import { COR_ORIGEM, NOME_ORIGEM, type LinhaAgenda, type LinhaBloqueio } from "@/lib/painel/agenda";
import { mudarStatus, removerBloqueio } from "@/app/(painel)/agenda/acoes";

const NOME_STATUS = {
  concluido: "Atendido",
  faltou: "Faltou",
  cancelado: "Cancelado",
  confirmado: "",
};

/** Uma linha de horário com as ações do dono. */
export function LinhaHorario({
  a,
  fuso,
  destaque = false,
}: {
  a: LinhaAgenda;
  fuso: string;
  destaque?: boolean;
}) {
  const feito = a.status !== "confirmado";
  return (
    <li
      className={`flex flex-col gap-2 rounded-cartao border bg-superficie p-3 ${
        destaque ? "border-texto" : "border-linha"
      } ${feito ? "opacity-70" : ""}`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <span
          className={`rounded-etiqueta px-2 py-1 font-bold tabular-nums ${COR_ORIGEM[a.origem]}`}
          title={`Marcado ${NOME_ORIGEM[a.origem]}`}
        >
          {horaNoFuso(a.inicio, fuso)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{a.cliente.nome}</p>
          <p className="truncate text-legenda text-texto-suave">
            {a.servico.nome} · até {horaNoFuso(a.fim, fuso)} · {NOME_ORIGEM[a.origem]}
          </p>
        </div>
        <span className="text-corpo text-texto-suave tabular-nums">
          {formatarPreco(a.servico.precoCentavos)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1 border-t border-linha pt-1">
        {feito ? (
          <>
            <span className="px-2 text-legenda font-semibold">{NOME_STATUS[a.status]}</span>
            <BotaoAcao
              acao={mudarStatus}
              campos={{ id: a.id, status: "confirmado" }}
              className={botaoDiscreto}
            >
              Desfazer
            </BotaoAcao>
          </>
        ) : (
          <>
            <a
              className={botaoDiscreto}
              href={`https://wa.me/${a.cliente.telefone.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir WhatsApp de ${a.cliente.nome}, ${formatarTelefone(a.cliente.telefone)}`}
            >
              WhatsApp
            </a>
            <BotaoAcao
              acao={mudarStatus}
              campos={{ id: a.id, status: "faltou" }}
              className={botaoDiscreto}
            >
              Faltou
            </BotaoAcao>
            <BotaoAcao
              acao={mudarStatus}
              campos={{ id: a.id, status: "cancelado" }}
              className={`${botaoDiscreto} text-erro`}
              confirmar={`Cancelar o horário de ${a.cliente.nome}?`}
            >
              Cancelar
            </BotaoAcao>
          </>
        )}
      </div>
    </li>
  );
}

export function LinhaBloqueioItem({
  b,
  fuso,
  diaInteiro,
}: {
  b: LinhaBloqueio;
  fuso: string;
  diaInteiro: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-cartao border border-dashed border-linha bg-pessego-suave p-3">
      <span className="rounded-etiqueta bg-superficie px-2 py-1 font-bold tabular-nums">
        {diaInteiro ? "Dia" : horaNoFuso(b.inicio, fuso)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">Bloqueado{b.motivo ? `: ${b.motivo}` : ""}</p>
        {!diaInteiro && (
          <p className="text-legenda text-texto-suave">
            {horaNoFuso(b.inicio, fuso)} às {horaNoFuso(b.fim, fuso)}
          </p>
        )}
      </div>
      <BotaoAcao
        acao={removerBloqueio}
        campos={{ id: b.id }}
        className={botaoDiscreto}
        confirmar="Liberar este horário?"
      >
        Liberar
      </BotaoAcao>
    </li>
  );
}

export function Legenda() {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-legenda text-texto-suave">
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-3 rounded-sm border border-texto/30 bg-amarelo-suave" />{" "}
        pela atendente
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-3 rounded-sm border border-texto/30 bg-cinza-suave" /> por
        você
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-3 rounded-sm border border-texto/30 bg-menta-suave" /> pelo
        link
      </span>
    </p>
  );
}
