import { corDoTexto, misturar, tomSuave } from "./cores";

export const SUPERFICIE_ESCURA = "#102038";

export type Aparencia = {
  cor_principal: string;
  cor_destaque: string;
  fundo: "claro" | "escuro";
  cantos: "retos" | "suaves" | "redondos";
};

/**
 * Variáveis CSS do tema de um negócio. A cor principal vira --marinho (estrutura)
 * e a de destaque vira --ciano (botão principal); o texto sobre cada uma é calculado
 * pela luminância, e o tom suave mistura o destaque com branco ou com a superfície escura.
 */
export function variaveisTema(a: Aparencia): Record<string, string> {
  return {
    "--marinho": a.cor_principal,
    "--ciano": a.cor_destaque,
    "--sobre-marinho": corDoTexto(a.cor_principal),
    "--sobre-ciano": corDoTexto(a.cor_destaque),
    "--ciano-gelo":
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
