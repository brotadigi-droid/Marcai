import { describe, expect, it } from "vitest";
import { BRANCO, PETROLEO, corDoTexto, luminancia, misturar, tomSuave } from "./cores";

describe("cores da Aparência", () => {
  it("usa texto petróleo sobre o amarelo da marca", () => {
    expect(corDoTexto("#FFD23F")).toBe(PETROLEO);
  });

  it("usa texto branco sobre o petróleo da marca", () => {
    expect(corDoTexto("#0F3D3E")).toBe(BRANCO);
  });

  it("acerta o texto das combinações prontas", () => {
    const prontas = [
      ["#0F4C5C", "#F2B33D"],
      ["#1B2F5B", "#FF9F43"],
      ["#1E4D3A", "#E9C46A"],
      ["#5B1A32", "#F2A7B8"],
      ["#2B2F36", "#5CC8D7"],
    ];
    for (const [principal, destaque] of prontas) {
      expect(corDoTexto(principal)).toBe(BRANCO);
      expect(corDoTexto(destaque)).toBe(PETROLEO);
    }
  });

  it("calcula a luminância nos extremos", () => {
    expect(luminancia("#000000")).toBe(0);
    expect(luminancia("#FFFFFF")).toBeCloseTo(1);
  });

  it("mistura cores", () => {
    expect(misturar("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(misturar("#FFD23F", "#FFFFFF", 0)).toBe("#FFD23F");
  });

  it("gera tom suave claro a partir da cor", () => {
    expect(luminancia(tomSuave("#FFD23F"))).toBeGreaterThan(luminancia("#FFD23F"));
  });

  it("recusa cor inválida", () => {
    expect(() => corDoTexto("amarelo")).toThrow("Cor inválida");
  });
});
