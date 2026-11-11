/** Formatos brasileiros usados na interface: dinheiro e telefone. */

/** 5000 -> "R$ 50"; 5050 -> "R$ 50,50" */
export function formatarPreco(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const resto = centavos % 100;
  const inteiro = reais.toLocaleString("pt-BR");
  return resto === 0 ? `R$ ${inteiro}` : `R$ ${inteiro},${String(resto).padStart(2, "0")}`;
}

/** "50", "50,5", "50,50", "R$ 1.200,00" -> centavos. null se não for um valor válido. */
export function lerPreco(texto: string): number | null {
  const limpo = texto
    .replace(/R\$|\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  return Math.round(Number(limpo) * 100);
}

/** Telefone brasileiro digitado de qualquer jeito -> E.164 (+55...). null se inválido. */
export function telefoneParaE164(texto: string): string | null {
  const t = texto.trim();
  let d = t.replace(/\D/g, "");
  if (t.startsWith("+")) {
    return /^[1-9]\d{7,14}$/.test(d) ? `+${d}` : null;
  }
  if (d.startsWith("0")) d = d.slice(1); // 0 de discagem
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  if (!/^55[1-9]\d\d{8,9}$/.test(d)) return null;
  return `+${d}`;
}

/** +5521990000001 -> "(21) 99000-0001" */
export function formatarTelefone(e164: string): string {
  const m = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

/** 90 -> "1h30"; 45 -> "45 min"; 60 -> "1h" */
export function formatarDuracao(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/** "Studio Ana Luz" -> "studio-ana-luz" */
export function paraSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
