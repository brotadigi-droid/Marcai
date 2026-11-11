import { describe, expect, it } from "vitest";
import {
  formatarDuracao,
  formatarPreco,
  formatarTelefone,
  lerPreco,
  paraSlug,
  telefoneParaE164,
} from "./formatos";

describe("formatos", () => {
  it("preço", () => {
    expect(formatarPreco(5000)).toBe("R$ 50");
    expect(formatarPreco(5050)).toBe("R$ 50,50");
    expect(formatarPreco(120000)).toBe("R$ 1.200");
    expect(lerPreco("50")).toBe(5000);
    expect(lerPreco("50,5")).toBe(5050);
    expect(lerPreco("R$ 1.200,00")).toBe(120000);
    expect(lerPreco("abc")).toBeNull();
    expect(lerPreco("-5")).toBeNull();
  });

  it("telefone", () => {
    expect(telefoneParaE164("(21) 99000-0001")).toBe("+5521990000001");
    expect(telefoneParaE164("21 3333-4444")).toBe("+552133334444");
    expect(telefoneParaE164("021 99000-0001")).toBe("+5521990000001");
    expect(telefoneParaE164("+55 21 99000-0001")).toBe("+5521990000001");
    expect(telefoneParaE164("99000-0001")).toBeNull(); // sem DDD
    expect(telefoneParaE164("abc")).toBeNull();
    expect(formatarTelefone("+5521990000001")).toBe("(21) 99000-0001");
  });

  it("duração e slug", () => {
    expect(formatarDuracao(45)).toBe("45 min");
    expect(formatarDuracao(60)).toBe("1h");
    expect(formatarDuracao(90)).toBe("1h30");
    expect(paraSlug("Studio Ana Luz")).toBe("studio-ana-luz");
    expect(paraSlug("  Barbearia do Zé!! ")).toBe("barbearia-do-ze");
  });
});
