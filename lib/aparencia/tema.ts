import { corDoTexto, misturar, tomSuave } from "./cores";

export const SUPERFICIE_ESCURA = "#122929";

export type Aparencia = {
  cor_principal: string;
  cor_destaque: string;
  fundo: "claro" | "escuro";
  cantos: "retos" | "suaves" | "redondos";
};

/**
 * Variáveis CSS do tema de um negócio. A cor principal vira --petroleo (estrutura)
 * e a de destaque vira --amarelo (botão principal); o texto sobre cada uma é calculado
 * pela luminância, e o tom suave mistura o destaque com branco ou com a superfície escura.
 */
export function variaveisTema(a: Aparencia): Record<string, string> {
  return {
    "--petroleo": a.cor_principal,
    "--amarelo": a.cor_destaque,
    "--sobre-petroleo": corDoTexto(a.cor_principal),
    "--sobre-amarelo": corDoTexto(a.cor_destaque),
    "--amarelo-suave":
      a.fundo === "escuro"
        ? misturar(a.cor_destaque, SUPERFICIE_ESCURA, 0.72)
        : tomSuave(a.cor_destaque),
  };
}

/** Atributos para o elemento que envolve o painel (tema escuro e cantos). */
export function atributosTema(a: Aparencia) {
  return {
    "data-tema": a.fundo,
    "data-cantos": a.cantos,
    style: variaveisTema(a) as React.CSSProperties,
  };
}
