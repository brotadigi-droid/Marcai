import type { Metadata } from "next";
import Link from "next/link";
import { FormAcao } from "@/components/FormAcao";
import { botaoDiscreto, campo, rotulo } from "@/components/ui";
import { dataNoFuso } from "@/lib/agenda/fuso";
import { diaDaBusca } from "@/lib/painel/datas";
import { negocioAtual } from "@/lib/painel/sessao";
import { bloquear } from "../acoes";

export const metadata: Metadata = { title: "Bloquear horário · Marcaí" };

export default async function Bloquear({ searchParams }: PageProps<"/agenda/bloquear">) {
  const busca = await searchParams;
  const { negocio } = await negocioAtual();
  const dia = diaDaBusca(busca.dia, negocio.fuso);
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:py-10">
      <Link href={`/agenda?dia=${dia}`} className={`${botaoDiscreto} -ml-3 self-start`}>
        ← Agenda
      </Link>
      <div>
        <h1 className="text-titulo">Bloquear horário</h1>
        <p className="mt-1 text-texto-suave">
          Ninguém consegue marcar num horário bloqueado. Os horários já marcados continuam.
        </p>
      </div>
      <FormAcao acao={bloquear} botao="Bloquear" enviando="Bloqueando…">
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Dia</span>
          <input
            className={campo}
            type="date"
            name="data"
            defaultValue={dia}
            min={dataNoFuso(new Date(), negocio.fuso)}
            required
          />
        </label>
        <label className="flex min-h-toque items-center gap-3">
          <input type="checkbox" name="dia_inteiro" className="peer size-5" />
          <span className="font-semibold">O dia inteiro</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Das</span>
            <input className={campo} type="time" name="de" step={300} defaultValue="12:00" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Até</span>
            <input className={campo} type="time" name="ate" step={300} defaultValue="14:00" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Motivo (só você vê)</span>
          <input className={campo} name="motivo" maxLength={120} placeholder="Consulta médica" />
        </label>
      </FormAcao>
    </main>
  );
}
