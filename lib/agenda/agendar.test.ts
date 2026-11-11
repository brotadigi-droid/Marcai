import { describe, expect, it } from "vitest";
import { marcarHorario, podeMudarStatus, verHorarios, type PedidoMarcacao } from "./agendar";
import { instanteLocal, paraMinutos } from "./fuso";
import { repositorioMemoria } from "./repositorio-memoria";

const SP = "America/Sao_Paulo";
const TERCA = "2026-11-17";
const sp = (hora: string) => instanteLocal(TERCA, paraMinutos(hora), SP);

const ESCOVA = { id: "escova", nome: "Escova", duracaoMin: 45, precoCentavos: 5000, ativo: true };
const COLORACAO = {
  id: "coloracao",
  nome: "Coloração",
  duracaoMin: 120,
  precoCentavos: 18000,
  ativo: true,
};
const PAUSADO = {
  id: "pausado",
  nome: "Hidratação",
  duracaoMin: 30,
  precoCentavos: 6000,
  ativo: false,
};

function novo() {
  return repositorioMemoria({
    servicos: [ESCOVA, COLORACAO, PAUSADO],
    horarios: [2, 3, 4, 5, 6].map((diaSemana) => ({
      diaSemana,
      abre: "09:00",
      fecha: "19:00",
      pausaInicio: "12:00",
      pausaFim: "13:00",
    })),
  });
}

const pedido = (extra: Partial<PedidoMarcacao> = {}): PedidoMarcacao => ({
  servicoId: "escova",
  data: TERCA,
  hora: "10:00",
  nomeCliente: "Carla",
  telefone: "+5521990000001",
  origem: "dono",
  agora: new Date("2026-11-10T12:00:00Z"),
  ...extra,
});

describe("marcarHorario", () => {
  it("marca um horário livre e cria o cliente", async () => {
    const { repo, estado } = novo();
    const r = await marcarHorario(repo, pedido());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.agendamento.inicio.toISOString()).toBe("2026-11-17T13:00:00.000Z");
    expect(r.agendamento.fim.toISOString()).toBe("2026-11-17T13:45:00.000Z");
    expect(estado.clientes).toEqual([
      { id: r.agendamento.clienteId, nome: "Carla", telefone: "+5521990000001" },
    ]);
    expect(estado.agendamentos[0].origem).toBe("dono");
  });

  it("reaproveita o cliente pelo telefone", async () => {
    const { repo, estado } = novo();
    await marcarHorario(repo, pedido());
    await marcarHorario(repo, pedido({ hora: "14:00", nomeCliente: "Carla Souza" }));
    expect(estado.clientes).toHaveLength(1);
    expect(estado.clientes[0].nome).toBe("Carla"); // não troca o nome já cadastrado
  });

  it("recusa horário ocupado e devolve os livres", async () => {
    const { repo } = novo();
    await marcarHorario(repo, pedido());
    const r = await marcarHorario(repo, pedido({ hora: "10:30", telefone: "+5521990000002" }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("10:30");
    expect(r.livres).toContain("09:00");
    expect(r.livres).not.toContain("10:00");
    expect(r.livres).not.toContain("10:30");
  });

  it("trata o horário que outra pessoa pegou no mesmo instante", async () => {
    const { repo, estado } = novo();
    // Alguém grava direto no banco depois da checagem: simulamos com o repositório.
    const buscar = repo.buscarOcupados.bind(repo);
    let primeira = true;
    repo.buscarOcupados = async (i, f) => {
      const r = await buscar(i, f);
      if (primeira) {
        primeira = false;
        estado.agendamentos.push({
          id: "concorrente",
          clienteId: "x",
          servicoId: "escova",
          origem: "link",
          status: "confirmado",
          inicio: sp("10:00"),
          fim: sp("10:45"),
        });
      }
      return r;
    };
    const r = await marcarHorario(repo, pedido());
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toBe("O horário 10:00 acabou de ser ocupado.");
    expect(r.livres).not.toContain("10:00");
  });

  it("recusa serviço pausado ou inexistente", async () => {
    const { repo } = novo();
    expect(await marcarHorario(repo, pedido({ servicoId: "pausado" }))).toMatchObject({
      ok: false,
    });
    expect(await marcarHorario(repo, pedido({ servicoId: "nao-existe" }))).toMatchObject({
      ok: false,
    });
  });

  it("recusa dia fechado, serviço que não cabe e nome vazio", async () => {
    const { repo } = novo();
    expect(await marcarHorario(repo, pedido({ data: "2026-11-15" }))).toMatchObject({
      ok: false,
      erro: "O negócio não abre nesse dia.",
    });
    expect(
      await marcarHorario(repo, pedido({ servicoId: "coloracao", hora: "11:00" })),
    ).toMatchObject({
      ok: false,
    });
    expect(await marcarHorario(repo, pedido({ nomeCliente: " " }))).toMatchObject({ ok: false });
    expect(await marcarHorario(repo, pedido({ hora: "25:00" }))).toMatchObject({ ok: false });
  });

  it("dono pode marcar em cima da hora; o link respeita a antecedência", async () => {
    const agora = sp("09:50");
    const dono = await marcarHorario(novo().repo, pedido({ agora, antecedenciaMin: 0 }));
    expect(dono.ok).toBe(true);
    const link = await marcarHorario(novo().repo, pedido({ agora, origem: "link" }));
    expect(link.ok).toBe(false);
  });

  it("bloqueio impede a marcação", async () => {
    const { repo, estado } = novo();
    estado.bloqueios.push({ inicio: sp("09:00"), fim: sp("12:00") });
    const r = await verHorarios(repo, ESCOVA, TERCA, new Date("2026-11-10T12:00:00Z"));
    expect(r.horarios[0]).toBe("13:00");
  });
});

describe("podeMudarStatus", () => {
  it("só permite transições que fazem sentido", () => {
    expect(podeMudarStatus("confirmado", "concluido")).toBe(true);
    expect(podeMudarStatus("confirmado", "faltou")).toBe(true);
    expect(podeMudarStatus("faltou", "confirmado")).toBe(true);
    expect(podeMudarStatus("cancelado", "confirmado")).toBe(false);
    expect(podeMudarStatus("concluido", "cancelado")).toBe(false);
  });
});
