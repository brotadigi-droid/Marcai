import { describe, expect, it } from "vitest";
import {
  horariosLivres,
  type EntradaDisponibilidade,
  type HorarioFuncionamento,
} from "./disponibilidade";
import { dataNoFuso, diaDaSemana, instanteLocal, paraMinutos } from "./fuso";

// 2026-11-17 é uma terça-feira. São Paulo está em UTC-3 (sem horário de verão).
const TERCA = "2026-11-17";
const DOMINGO = "2026-11-15";
const SP = "America/Sao_Paulo";

// Terça a sábado, 09:00 às 19:00, almoço 12:00 às 13:00 (como o salão do seed).
const HORARIOS: HorarioFuncionamento[] = [2, 3, 4, 5, 6].map((diaSemana) => ({
  diaSemana,
  abre: "09:00",
  fecha: "19:00",
  pausaInicio: "12:00",
  pausaFim: "13:00",
}));

/** Instante em São Paulo, ex.: sp("2026-11-17", "10:00"). */
const sp = (data: string, hora: string) => instanteLocal(data, paraMinutos(hora), SP);

function entrada(extra: Partial<EntradaDisponibilidade> = {}): EntradaDisponibilidade {
  return {
    data: TERCA,
    fuso: SP,
    horarios: HORARIOS,
    bloqueios: [],
    agendamentos: [],
    duracaoMin: 45,
    agora: new Date("2026-11-10T12:00:00Z"), // uma semana antes
    ...extra,
  };
}

const livres = (extra: Partial<EntradaDisponibilidade> = {}) => {
  const r = horariosLivres(entrada(extra));
  return r.horarios;
};

describe("horariosLivres", () => {
  it("oferece horários de 30 em 30 minutos dentro do expediente", () => {
    expect(livres()).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ]);
  });

  it("dia fechado", () => {
    const r = horariosLivres(entrada({ data: DOMINGO }));
    expect(r).toEqual({ fechado: true, horarios: [] });
  });

  it("almoço: não oferece serviço que invade a pausa", () => {
    const h = livres();
    expect(h).toContain("11:00"); // 11:00 a 11:45, antes do almoço
    expect(h).not.toContain("11:30"); // 11:30 a 12:15, invade o almoço
    expect(h).not.toContain("12:00");
    expect(h).not.toContain("12:30");
    expect(h).toContain("13:00"); // logo depois do almoço
  });

  it("encaixe exato: serviço que termina na hora de fechar, no almoço ou no próximo horário", () => {
    // Corte de 60 min: 18:00 às 19:00 termina exatamente no fechamento.
    expect(livres({ duracaoMin: 60 })).toContain("18:00");
    // 11:00 às 12:00 termina exatamente no início do almoço.
    expect(livres({ duracaoMin: 60 })).toContain("11:00");
    // Agendamento às 10:00: o horário das 09:00 (60 min) termina às 10:00 e cabe.
    const h = livres({
      duracaoMin: 60,
      agendamentos: [{ inicio: sp(TERCA, "10:00"), fim: sp(TERCA, "11:00") }],
    });
    expect(h).toContain("09:00");
    expect(h).not.toContain("09:30");
    expect(h).not.toContain("10:00");
    expect(h).not.toContain("10:30");
    expect(h).toContain("11:00"); // começa exatamente quando o outro termina
  });

  it("serviço longo que não cabe", () => {
    // Coloração de 120 min: não cabe 10:30 (invade almoço) nem 17:30 (passa das 19:00).
    const h = livres({ duracaoMin: 120 });
    expect(h).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ]);
    // Um serviço maior que o expediente não tem horário.
    expect(livres({ duracaoMin: 11 * 60 })).toEqual([]);
  });

  it("horários que já passaram hoje, com 30 minutos de antecedência", () => {
    const agora = sp(TERCA, "14:10");
    const h = livres({ agora });
    expect(h[0]).toBe("15:00"); // 14:30 fica a menos de 30 minutos
    expect(h).not.toContain("14:30");
    // Sem antecedência, 14:30 já pode.
    expect(livres({ agora, antecedenciaMin: 0 })[0]).toBe("14:30");
  });

  it("dia que já passou não tem horários", () => {
    const r = horariosLivres(entrada({ agora: sp("2026-11-18", "08:00") }));
    expect(r).toEqual({ fechado: false, horarios: [] });
  });

  it("bloqueios", () => {
    const h = livres({
      bloqueios: [{ inicio: sp(TERCA, "15:00"), fim: sp(TERCA, "16:30") }],
    });
    expect(h).toContain("14:00"); // 14:00 às 14:45
    expect(h).not.toContain("14:30"); // 14:30 às 15:15 bate no bloqueio
    expect(h).not.toContain("15:00");
    expect(h).not.toContain("16:00");
    expect(h).toContain("16:30"); // começa quando o bloqueio termina
  });

  it("bloqueio do dia inteiro deixa o dia sem horários", () => {
    const h = livres({
      bloqueios: [{ inicio: sp(TERCA, "00:00"), fim: sp("2026-11-18", "00:00") }],
    });
    expect(h).toEqual([]);
  });

  describe("fuso America/Sao_Paulo", () => {
    it("converte a hora de parede para o instante certo (UTC-3)", () => {
      expect(sp(TERCA, "10:00").toISOString()).toBe("2026-11-17T13:00:00.000Z");
    });

    it("23:30 em São Paulo ainda é o dia anterior, mesmo já sendo o dia seguinte em UTC", () => {
      const agora = new Date("2026-11-17T02:30:00Z"); // 16/11 às 23:30 em São Paulo
      expect(dataNoFuso(agora, SP)).toBe("2026-11-16");
      // Então a terça 17/11 inteira continua livre.
      expect(livres({ agora })[0]).toBe("09:00");
    });

    it("agendamento gravado em UTC ocupa o horário certo na hora local", () => {
      const h = livres({
        agendamentos: [
          { inicio: new Date("2026-11-17T13:00:00Z"), fim: new Date("2026-11-17T13:45:00Z") },
        ],
      });
      expect(h).not.toContain("10:00"); // 13:00 UTC = 10:00 em São Paulo
      expect(h).toContain("09:00");
      expect(h).toContain("11:00");
    });

    it("usa o fuso do negócio: Manaus (UTC-4) é diferente de São Paulo", () => {
      const manaus = instanteLocal(TERCA, paraMinutos("10:00"), "America/Manaus");
      expect(manaus.toISOString()).toBe("2026-11-17T14:00:00.000Z");
    });
  });

  describe("entradas inválidas", () => {
    it("recusa data, duração e fuso inválidos", () => {
      expect(() => horariosLivres(entrada({ data: "17/11/2026" }))).toThrow("Data inválida");
      expect(() => horariosLivres(entrada({ data: "2026-02-30" }))).toThrow("Data inválida");
      expect(() => horariosLivres(entrada({ duracaoMin: 0 }))).toThrow("Duração inválida");
      expect(() => horariosLivres(entrada({ fuso: "Lua/Base" }))).toThrow();
    });
  });
});

describe("fuso", () => {
  it("dia da semana", () => {
    expect(diaDaSemana(TERCA)).toBe(2);
    expect(diaDaSemana(DOMINGO)).toBe(0);
  });

  it("aceita hora no formato do Postgres (HH:MM:SS)", () => {
    expect(paraMinutos("09:30:00")).toBe(570);
  });
});
