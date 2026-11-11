import type { Metadata } from "next";
import { FormAcao } from "@/components/FormAcao";
import { Voltar } from "@/components/painel/Voltar";
import { cartao } from "@/components/ui";
import { DIAS_SEMANA } from "@/lib/agenda/rotulos";
import { negocioAtual } from "@/lib/painel/sessao";
import { salvarHorarios } from "../acoes";

export const metadata: Metadata = { title: "Horários · Marcaí" };

const ORDEM = [1, 2, 3, 4, 5, 6, 0]; // segunda a domingo
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");
const campoHora =
  "min-h-toque w-full min-w-0 rounded-botao border border-linha bg-superficie px-2 tabular-nums outline-none focus:border-texto disabled:opacity-40";

export default async function Horarios() {
  const { negocio, db } = await negocioAtual();
  const { data } = await db
    .from("horarios_funcionamento")
    .select("dia_semana, abre, fecha, pausa_inicio, pausa_fim")
    .eq("negocio_id", negocio.id);
  const porDia = new Map((data ?? []).map((h) => [h.dia_semana, h]));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
      <Voltar />
      <div>
        <h1 className="text-titulo">Horários</h1>
        <p className="mt-1 text-texto-suave">
          A atendente só oferece horários dentro do atendimento e fora do almoço.
        </p>
      </div>
      <FormAcao acao={salvarHorarios} botao="Salvar horários" enviando="Salvando…">
        <ul className="flex flex-col gap-2">
          {ORDEM.map((d) => {
            const h = porDia.get(d);
            return (
              <li
                key={d}
                className={`${cartao} flex flex-col gap-3 p-3 has-[input[type=checkbox]:not(:checked)]:bg-cinza-suave`}
              >
                <label className="flex min-h-toque items-center gap-3">
                  <input
                    type="checkbox"
                    name={`aberto_${d}`}
                    defaultChecked={Boolean(h)}
                    className="peer size-5"
                  />
                  <span className="font-semibold capitalize">{DIAS_SEMANA[d]}</span>
                  <span className="ml-auto text-legenda text-texto-suave peer-checked:hidden">
                    Fechado
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
                  <label className="flex flex-col gap-1 text-legenda font-semibold">
                    Abre
                    <input
                      className={campoHora}
                      type="time"
                      step={300}
                      name={`abre_${d}`}
                      defaultValue={hhmm(h?.abre) || "09:00"}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-legenda font-semibold">
                    Fecha
                    <input
                      className={campoHora}
                      type="time"
                      step={300}
                      name={`fecha_${d}`}
                      defaultValue={hhmm(h?.fecha) || "19:00"}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-legenda font-semibold">
                    Almoço de
                    <input
                      className={campoHora}
                      type="time"
                      step={300}
                      name={`pausa_inicio_${d}`}
                      defaultValue={h ? hhmm(h.pausa_inicio) : "12:00"}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-legenda font-semibold">
                    Até
                    <input
                      className={campoHora}
                      type="time"
                      step={300}
                      name={`pausa_fim_${d}`}
                      defaultValue={h ? hhmm(h.pausa_fim) : "13:00"}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-legenda text-texto-suave">
          Sem almoço? Apague os dois horários do almoço.
        </p>
      </FormAcao>
    </main>
  );
}
