/** Combinações prontas da aba Aparência (docs/marca.md). */
export const PRESETS = [
  { nome: "Amarelo e petróleo", principal: "#0F3D3E", destaque: "#FFD23F" },
  { nome: "Petróleo e mostarda", principal: "#0F4C5C", destaque: "#F2B33D" },
  { nome: "Marinho e laranja", principal: "#1B2F5B", destaque: "#FF9F43" },
  { nome: "Verde e areia", principal: "#1E4D3A", destaque: "#E9C46A" },
  { nome: "Vinho e rosé", principal: "#5B1A32", destaque: "#F2A7B8" },
  { nome: "Grafite e ciano", principal: "#2B2F36", destaque: "#5CC8D7" },
] as const;

export const CANTOS = [
  { valor: "retos", nome: "Retos" },
  { valor: "suaves", nome: "Suaves" },
  { valor: "redondos", nome: "Redondos" },
] as const;
