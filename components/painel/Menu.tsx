"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const ITENS = [
  {
    href: "/hoje",
    nome: "Hoje",
    icone:
      "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  },
  { href: "/agenda", nome: "Agenda", icone: "M5 7h14v13H5zM5 11h14M9 4v5M15 4v5" },
  { href: "/ajustes", nome: "Ajustes", icone: "M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4" },
];

function Icone({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Menu do painel: barra embaixo no celular, coluna lateral em marinho no computador. */
export function Menu({ nomeNegocio }: { nomeNegocio?: string }) {
  const caminho = usePathname();
  const ativo = (href: string) => caminho === href || caminho.startsWith(`${href}/`);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-8 bg-marinho px-4 py-6 text-sobre-marinho md:flex">
        <Link href="/hoje" className="px-2" aria-label="Marcaí, início">
          <Logo fundo="escuro" tamanho={30} />
        </Link>
        {nomeNegocio && <p className="px-2 text-legenda opacity-80">{nomeNegocio}</p>}
        <nav aria-label="Painel" className="flex flex-col gap-1">
          {ITENS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={ativo(i.href) ? "page" : undefined}
              className="flex min-h-toque items-center gap-3 rounded-botao px-3 font-semibold transition hover:bg-white/10 aria-[current=page]:bg-ciano aria-[current=page]:text-sobre-ciano"
            >
              <Icone d={i.icone} />
              {i.nome}
            </Link>
          ))}
        </nav>
      </aside>

      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-marinho pb-[env(safe-area-inset-bottom)] text-sobre-marinho md:hidden"
      >
        {ITENS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={ativo(i.href) ? "page" : undefined}
            className="group flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-legenda font-semibold"
          >
            <span className="flex h-8 w-14 items-center justify-center rounded-full transition group-aria-[current=page]:bg-ciano group-aria-[current=page]:text-sobre-ciano">
              <Icone d={i.icone} />
            </span>
            {i.nome}
          </Link>
        ))}
      </nav>
    </>
  );
}
