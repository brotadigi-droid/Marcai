import { describe, expect, it } from "vitest";
import { atendimentoAtual } from "./atendimento";
import { horaNoFuso, limitesDoDia, semanaDe, somarDias } from "./fuso";
import { rotuloDia } from "./rotulos";

const t = (iso: string) => new Date(iso);
const item = (id: string, inicio: string, fim: string, status = "confirmado") => ({
  id,
  inicio: t(inicio),
  fim: t(fim),
  status,
});

describe("atendimentoAtual", () => {
  const dia = [
    item("a", "2026-11-17T12:00:00Z", "2026-11-17T12:45:00Z", "concluido"),
    item("b", "2026-11-17T13:00:00Z", "2026-11-17T13:45:00Z"),
    item("c", "2026-11-17T17:00:00Z", "2026-11-17T18:00:00Z"),
  ];

  it("mostra quem já começou, mesmo atrasado", () => {
    expect(atendimentoAtual(dia, t("2026-11-17T13:10:00Z"))).toMatchObject({
      tipo: "atendendo",
      item: { id: "b" },
    });
    expect(atendimentoAtual(dia, t("2026-11-17T14:30:00Z"))).toMatchObject({
      tipo: "atendendo",
      item: { id: "b" },
    });
  });

  it("mostra quem chega em até 15 minutos", () => {
    expect(atendimentoAtual(dia, t("2026-11-17T12:50:00Z"))).toMatchObject({
      tipo: "chegando",
      item: { id: "b" },
    });
  });

  it("livre com o próximo, ou sem ninguém", () => {
    expect(atendimentoAtual(dia, t("2026-11-17T11:00:00Z"))).toMatchObject({
      tipo: "livre",
      proximo: { id: "b" },
    });
    expect(atendimentoAtual([], t("2026-11-17T11:00:00Z"))).toEqual({
      tipo: "livre",
      proximo: null,
    });
  });
});

describe("datas da agenda", () => {
  it("semana de segunda a domingo", () => {
    expect(semanaDe("2026-11-17")).toEqual([
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
    expect(semanaDe("2026-11-22")[0]).toBe("2026-11-16"); // domingo fica na semana que começou na segunda
  });

  it("limites do dia em São Paulo e virada de mês", () => {
    const { inicio, fim } = limitesDoDia("2026-11-17", "America/Sao_Paulo");
    expect(inicio.toISOString()).toBe("2026-11-17T03:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-11-18T03:00:00.000Z");
    expect(somarDias("2026-11-30", 1)).toBe("2026-12-01");
    expect(horaNoFuso(t("2026-11-17T13:05:00Z"), "America/Sao_Paulo")).toBe("10:05");
  });

  it("rótulos", () => {
    expect(rotuloDia("2026-11-17", "2026-11-17")).toBe("Hoje");
    expect(rotuloDia("2026-11-18", "2026-11-17")).toBe("Amanhã");
    expect(rotuloDia("2026-11-20", "2026-11-17")).toBe("Sexta, 20 nov");
  });
});
