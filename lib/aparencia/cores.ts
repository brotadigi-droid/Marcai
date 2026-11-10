/**
 * Regras de contraste da aba Aparência (docs/marca.md):
 * - texto escuro sobre cores com luminância acima de 0,4; branco nas demais;
 * - tom suave = cor misturada com branco (72%).
 */

export const PETROLEO = "#0F3D3E";
export const BRANCO = "#FFFFFF";

function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) throw new Error(`Cor inválida: ${hex}`);
  const n = parseInt(limpo, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminância relativa (WCAG), de 0 (preto) a 1 (branco). */
export function luminancia(hex: string): number {
  const [r, g, b] = paraRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Cor do texto que vai por cima de `fundo`. */
export function corDoTexto(fundo: string): string {
  return luminancia(fundo) > 0.4 ? PETROLEO : BRANCO;
}

/** Mistura `a` com `b` na proporção `t` (0 = só a, 1 = só b). */
export function misturar(a: string, b: string, t: number): string {
  const x = paraRgb(a);
  const y = paraRgb(b);
  return (
    "#" +
    x
      .map((v, i) =>
        Math.round(v + (y[i] - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

/** Tom suave de uma cor para o tema claro. */
export function tomSuave(hex: string): string {
  return misturar(hex, BRANCO, 0.72);
}
