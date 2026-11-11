"use client";

import { useState } from "react";
import { FormAcao } from "@/components/FormAcao";
import { rotulo } from "@/components/ui";
import { CANTOS, PRESETS } from "@/lib/aparencia/presets";
import { variaveisTema, type Aparencia } from "@/lib/aparencia/tema";
import { salvarAparencia } from "../acoes";

const opcao =
  "flex min-h-toque cursor-pointer items-center justify-center rounded-botao border border-linha bg-superficie px-3 font-semibold has-checked:border-texto has-checked:ring-2 has-checked:ring-texto";

export function Editor({
  inicial,
  atendente,
  negocio,
}: {
  inicial: Aparencia;
  atendente: string;
  negocio: string;
}) {
  const [a, setA] = useState<Aparencia>(inicial);
  const muda = (p: Partial<Aparencia>) => setA((x) => ({ ...x, ...p }));
  const presetAtivo = PRESETS.find(
    (p) =>
      p.principal.toLowerCase() === a.cor_principal.toLowerCase() &&
      p.destaque.toLowerCase() === a.cor_destaque.toLowerCase(),
  );

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <FormAcao acao={salvarAparencia} botao="Salvar aparência" enviando="Salvando…">
        <input type="hidden" name="cor_principal" value={a.cor_principal} />
        <input type="hidden" name="cor_destaque" value={a.cor_destaque} />

        <fieldset className="flex flex-col gap-2">
          <legend className={`${rotulo} mb-2`}>Combinações prontas</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button
                key={p.nome}
                type="button"
                aria-pressed={presetAtivo === p}
                onClick={() => muda({ cor_principal: p.principal, cor_destaque: p.destaque })}
                className="flex flex-col overflow-hidden rounded-cartao border-2 border-transparent bg-superficie text-left aria-pressed:border-texto"
              >
                <span className="flex h-12">
                  <i className="flex-2" style={{ background: p.principal }} />
                  <i className="flex-1" style={{ background: p.destaque }} />
                </span>
                <span className="px-3 py-2 text-legenda font-semibold">{p.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-3">
          <legend className={`${rotulo} mb-2`}>Cor livre</legend>
          <label className="flex min-h-toque items-center gap-3 rounded-botao border border-linha bg-superficie px-3">
            <input
              type="color"
              value={a.cor_principal}
              onChange={(e) => muda({ cor_principal: e.target.value })}
              className="size-8 cursor-pointer"
            />
            <span className="text-legenda font-semibold">Principal</span>
          </label>
          <label className="flex min-h-toque items-center gap-3 rounded-botao border border-linha bg-superficie px-3">
            <input
              type="color"
              value={a.cor_destaque}
              onChange={(e) => muda({ cor_destaque: e.target.value })}
              className="size-8 cursor-pointer"
            />
            <span className="text-legenda font-semibold">Destaque</span>
          </label>
        </fieldset>

        <fieldset>
          <legend className={`${rotulo} mb-2`}>Fundo</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["claro", "escuro"] as const).map((f) => (
              <label key={f} className={opcao}>
                <input
                  type="radio"
                  name="fundo"
                  value={f}
                  checked={a.fundo === f}
                  onChange={() => muda({ fundo: f })}
                  className="sr-only"
                />
                {f === "claro" ? "Claro" : "Escuro"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={`${rotulo} mb-2`}>Cantos</legend>
          <div className="grid grid-cols-3 gap-2">
            {CANTOS.map((c) => (
              <label key={c.valor} className={opcao}>
                <input
                  type="radio"
                  name="cantos"
                  value={c.valor}
                  checked={a.cantos === c.valor}
                  onChange={() => muda({ cantos: c.valor })}
                  className="sr-only"
                />
                {c.nome}
              </label>
            ))}
          </div>
        </fieldset>
      </FormAcao>

      <aside aria-label="Prévia" className="md:sticky md:top-6 md:self-start">
        <p className={`${rotulo} mb-2`}>Prévia</p>
        <div
          data-tema={a.fundo}
          data-cantos={a.cantos}
          style={variaveisTema(a) as React.CSSProperties}
          className="flex flex-col gap-3 rounded-destaque border border-linha p-4"
        >
          <div className="flex items-center gap-2 rounded-cartao bg-marinho p-3 text-sobre-marinho">
            <span className="grid size-8 place-items-center rounded-full bg-ciano font-semibold text-sobre-ciano">
              {atendente.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate text-legenda font-semibold">
              {atendente} · {negocio}
            </span>
          </div>
          <p className="max-w-[85%] self-end rounded-destaque rounded-br-md bg-cinza-suave px-3 py-2 text-corpo">
            tem horário amanhã?
          </p>
          <p className="max-w-[85%] rounded-destaque rounded-bl-md bg-marinho px-3 py-2 text-corpo text-sobre-marinho">
            Tenho 10:00 ou 14:30. Qual fica melhor?
          </p>
          <div className="flex items-center gap-2 rounded-cartao border border-linha bg-superficie p-2.5">
            <span className="rounded-etiqueta bg-ciano-gelo px-2 py-0.5 font-bold tabular-nums">
              10:00
            </span>
            <span className="text-legenda">Carla, escova</span>
          </div>
          <span className="inline-flex min-h-toque items-center justify-center rounded-botao bg-ciano font-bold text-sobre-ciano">
            Marcar às 10:00
          </span>
        </div>
      </aside>
    </div>
  );
}
