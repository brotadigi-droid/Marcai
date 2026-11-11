import { Suspense } from "react";
import { Menu } from "@/components/painel/Menu";
import { atributosTema } from "@/lib/aparencia/tema";
import { negocioAtual } from "@/lib/painel/sessao";

/** Casca do painel: aplica o tema do negócio e mostra o menu. Lê a sessão, por isso fica no Suspense. */
async function Casca({ children }: { children: React.ReactNode }) {
  const { negocio } = await negocioAtual();
  return (
    <div {...atributosTema(negocio)} className="flex min-h-dvh flex-1 flex-col">
      <Menu nomeNegocio={negocio.nome} />
      <div className="flex flex-1 flex-col pb-24 md:pb-0 md:pl-60">{children}</div>
    </div>
  );
}

function Carregando() {
  return (
    <div
      className="flex min-h-dvh flex-1 items-center justify-center text-texto-suave"
      role="status"
    >
      Carregando…
    </div>
  );
}

export default function LayoutPainel({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Casca>{children}</Casca>
    </Suspense>
  );
}
