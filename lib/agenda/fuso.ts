/**
 * Conversões entre "hora de parede" num fuso (ex.: 2026-11-17 10:00 em São Paulo)
 * e instantes absolutos (Date). Usa só o Intl do JavaScript, sem bibliotecas.
 */

const RE_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formatadores = new Map<string, Intl.DateTimeFormat>();

function formatador(fuso: string): Intl.DateTimeFormat {
  let f = formatadores.get(fuso);
  if (!f) {
    // Lança RangeError se o fuso não existir.
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: fuso,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatadores.set(fuso, f);
  }
  return f;
}

/** Partes da data e hora de `instante` vistas no `fuso`. */
export function partesNoFuso(instante: Date, fuso: string) {
  const p: Record<string, number> = {};
  for (const { type, value } of formatador(fuso).formatToParts(instante)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return {
    ano: p.year,
    mes: p.month,
    dia: p.day,
    hora: p.hour,
    minuto: p.minute,
    segundo: p.second,
  };
}

/** Diferença do fuso para UTC, em minutos, naquele instante (São Paulo = -180). */
function deslocamentoMin(instante: Date, fuso: string): number {
  const p = partesNoFuso(instante, fuso);
  const comoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return Math.round((comoUtc - Math.floor(instante.getTime() / 1000) * 1000) / 60000);
}

export function lerData(data: string): { ano: number; mes: number; dia: number } {
  const m = RE_DATA.exec(data);
  if (!m) throw new Error(`Data inválida: "${data}". Use AAAA-MM-DD.`);
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    throw new Error(`Data inválida: "${data}".`);
  }
  return { ano, mes, dia };
}

/** "HH:MM" (ou "HH:MM:SS", como vem do Postgres) para minutos desde a meia-noite. */
export function paraMinutos(hora: string): number {
  const m = RE_HORA.exec(hora.slice(0, 5));
  if (!m) throw new Error(`Hora inválida: "${hora}". Use HH:MM.`);
  return Number(m[1]) * 60 + Number(m[2]);
}

export function paraHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Dia da semana de uma data AAAA-MM-DD (0 = domingo ... 6 = sábado). */
export function diaDaSemana(data: string): number {
  const { ano, mes, dia } = lerData(data);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

/** Data AAAA-MM-DD de um instante, no fuso. */
export function dataNoFuso(instante: Date, fuso: string): string {
  const p = partesNoFuso(instante, fuso);
  return `${p.ano}-${String(p.mes).padStart(2, "0")}-${String(p.dia).padStart(2, "0")}`;
}

/** Instante absoluto de `data` + `minutos` desde a meia-noite, no fuso. */
export function instanteLocal(data: string, minutos: number, fuso: string): Date {
  const { ano, mes, dia } = lerData(data);
  const comoUtc = Date.UTC(ano, mes - 1, dia, 0, minutos);
  // Dois passos acertam o deslocamento mesmo perto de mudança de horário de verão.
  let t = comoUtc - deslocamentoMin(new Date(comoUtc), fuso) * 60000;
  t = comoUtc - deslocamentoMin(new Date(t), fuso) * 60000;
  return new Date(t);
}
