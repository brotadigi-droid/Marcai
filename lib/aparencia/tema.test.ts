import { describe, expect, it } from "vitest";
import { luminancia } from "./cores";
import { variaveisTema } from "./tema";

describe("variaveisTema", () => {
  it("usa as cores do negócio e calcula o texto", () => {
    const v = variaveisTema({
      cor_principal: "#5B1A32",
      cor_destaque: "#F2A7B8",
      fundo: "claro",
      cantos: "suaves",
    });
    expect(v["--petroleo"]).toBe("#5B1A32");
    expect(v["--sobre-petroleo"]).toBe("#FFFFFF");
    expect(v["--sobre-amarelo"]).toBe("#0F3D3E");
  });

  it("tom suave claro no fundo claro e escuro no fundo escuro", () => {
    const claro = variaveisTema({
      cor_principal: "#0F3D3E",
      cor_destaque: "#FFD23F",
      fundo: "claro",
      cantos: "suaves",
    });
    const escuro = variaveisTema({
      cor_principal: "#0F3D3E",
      cor_destaque: "#FFD23F",
      fundo: "escuro",
      cantos: "suaves",
    });
    expect(luminancia(claro["--amarelo-suave"])).toBeGreaterThan(0.6);
    expect(luminancia(escuro["--amarelo-suave"])).toBeLessThan(0.1);
  });
});
