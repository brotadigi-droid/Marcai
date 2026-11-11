/** Combinações prontas da aba Aparência (docs/marca.md). */
export const PRESETS = [
  { nome: "Marinho e ciano", principal: "#0F2340", destaque: "#14B8C4" },
  { nome: "Grafite e âmbar", principal: "#23272F", destaque: "#FFB547" },
  { nome: "Verde e areia", principal: "#1E4D3A", destaque: "#E9C46A" },
  { nome: "Vinho e rosé", principal: "#5B1A32", destaque: "#F2A7B8" },
  { nome: "Petróleo e mostarda", principal: "#0F4C5C", destaque: "#F2B33D" },
  { nome: "Azul e tangerina", principal: "#13203A", destaque: "#FF7A3D" },
] as const;

export const CANTOS = [
  { valor: "retos", nome: "Retos" },
  { valor: "suaves", nome: "Suaves" },
  { valor: "redondos", nome: "Redondos" },
] as const;
