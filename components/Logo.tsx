type LogoProps = {
  /** "claro": balão marinho e visto ciano. "escuro": balão ciano e visto marinho. */
  fundo?: "claro" | "escuro";
  tamanho?: number;
  comNome?: boolean;
};

export function Logo({ fundo = "claro", tamanho = 36, comNome = true }: LogoProps) {
  const balao = fundo === "claro" ? "#0F2340" : "#14B8C4";
  const visto = fundo === "claro" ? "#14B8C4" : "#0F2340";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M14 8h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H28l-13 10V50a10 10 0 0 1-11-10V18A10 10 0 0 1 14 8z"
          fill={balao}
        />
        <path d="M22 3v10M42 3v10" stroke={balao} strokeWidth={5} strokeLinecap="round" />
        <path
          d="M20 29l8 8 16-16"
          fill="none"
          stroke={visto}
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {comNome && (
        <b
          className="text-[25px] font-semibold tracking-[-0.045em]"
          style={{ color: fundo === "claro" ? "#0F2340" : "#FFFFFF" }}
        >
          marcaí
        </b>
      )}
      <span className="sr-only">Marcaí</span>
    </span>
  );
}
