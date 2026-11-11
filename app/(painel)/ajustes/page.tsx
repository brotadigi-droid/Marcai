import type { Metadata } from "next";
import Link from "next/link";
import { botaoSecundario, cartao } from "@/components/ui";
import { negocioAtual } from "@/lib/painel/sessao";
import { sair } from "@/app/entrar/acoes";

export const metadata: Metadata = { title: "Ajustes · Marcaí" };

const SECOES = [
  { href: "/ajustes/servicos", nome: "Serviços", texto: "Nomes, duração e preços" },
  { href: "/ajustes/horarios", nome: "Horários", texto: "Dias de atendimento e almoço" },
  { href: "/ajustes/aparencia", nome: "Aparência", texto: "Cores, fundo e cantos" },
  {
    href: "/ajustes/negocio",
    nome: "Negócio e atendente",
    texto: "Endereço, nome da atendente, tom e avisos",
  },
];

export default async function Ajustes() {
  const { negocio, usuario } = await negocioAtual();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
      <h1 className="text-titulo">Ajustes</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SECOES.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className={`${cartao} flex min-h-20 flex-col justify-center gap-0.5 p-4 transition hover:border-texto`}
            >
              <span className="font-bold">{s.nome}</span>
              <span className="text-legenda text-texto-suave">{s.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className={`${cartao} flex flex-col gap-1 p-4`}>
        <p className="text-legenda text-texto-suave">Sua página de agendamento</p>
        <p className="font-semibold break-all">marcai.app/{negocio.slug}</p>
        <p className="text-legenda text-texto-suave">Ela entra no ar na próxima etapa.</p>
      </section>
      <form
        action={sair}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-linha pt-5"
      >
        <span className="text-legenda break-all text-texto-suave">Entrou como {usuario.email}</span>
        <button type="submit" className={botaoSecundario}>
          Sair
        </button>
      </form>
    </main>
  );
}
