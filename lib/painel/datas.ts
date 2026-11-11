import { dataNoFuso, lerData } from "@/lib/agenda/fuso";

/** Data pedida na URL (?dia=AAAA-MM-DD) ou hoje no fuso do negócio. */
export function diaDaBusca(
  valor: string | string[] | undefined,
  fuso: string,
  agora = new Date(),
): string {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (v) {
    try {
      lerData(v);
      return v;
    } catch {
      // cai para hoje
    }
  }
  return dataNoFuso(agora, fuso);
}
