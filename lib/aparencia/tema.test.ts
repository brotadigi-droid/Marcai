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
    expect(v["--marinho"]).toBe("#5B1A32");
    expect(v["--sobre-marinho"]).toBe("#FFFFFF");
    expect(v["--sobre-ciano"]).toBe("#0F2340");
  });

  it("tom suave claro no fundo claro e escuro no fundo escuro", () => {
    const claro = variaveisTema({
      cor_principal: "#0F2340",
      cor_destaque: "#14B8C4",
      fundo: "claro",
      cantos: "suaves",
    });
    const escuro = variaveisTema({
      cor_principal: "#0F2340",
      cor_destaque: "#14B8C4",
      fundo: "escuro",
      cantos: "suaves",
    });
    expect(luminancia(claro["--ciano-gelo"])).toBeGreaterThan(0.6);
    expect(luminancia(escuro["--ciano-gelo"])).toBeLessThan(0.1);
  });
});
